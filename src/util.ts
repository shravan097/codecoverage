import * as NodeUtil from 'util'
import * as fs from 'fs'
import * as github from '@actions/github'
import {Octokit} from 'octokit'
import parser from 'lcov-parse'

export type CoverageFile = {
  fileName: string
  missingLineNumbers: number[]
}

export type LCovParsed = {
  file: string
  title: string
  lines: {
    found: number
    hit: number
    details: {
      line: number
      hit: number
      name: string
    }[]
  }
}[]

export async function parseLCov(lcovPath: string): Promise<LCovParsed> {
  if (!lcovPath) {
    throw Error('No LCov path provided')
  }
  const parserPromise = NodeUtil.promisify(parser)
  const fileRaw = fs.readFileSync(lcovPath, 'utf8')
  return parserPromise(fileRaw) as LCovParsed
}

export function filterCoverageByFile(coverage: LCovParsed): CoverageFile[] {
  return coverage.map(item => ({
    fileName: item.file,
    missingLineNumbers: item?.lines?.details
      .filter(line => line.hit === 0)
      .map(line => line.line)
  }))
}

export async function annotateGithub(
  coverageFiles: CoverageFile[],
  githubToken: string
): Promise<unknown> {
  if (!githubToken) {
    throw Error('GITHUB_TOKEN is missing')
  }
  const octokit = new Octokit({auth: githubToken})
  const response = await octokit.rest.checks.create({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    name: 'Coverage Checker',
    status: 'completed',
    conclusion: 'success',
    output: {
      title: 'Coverage Tool',
      summary: 'Missing Coverage',
      annotations: coverageFiles.reduce((old, current) => {
        current.missingLineNumbers.map(lineNumber => {
          old.push({
            path: current.fileName,
            start_line: lineNumber,
            end_line: lineNumber,
            start_column: 1,
            end_column: 1,
            annotation_level: 'warning',
            message: 'this line is not covered by test'
          })
        })
        return old
      }, [] as unknown as [Object])
    }
  })
  return response
}
