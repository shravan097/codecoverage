import * as NodeUtil from 'util'
import * as core from '@actions/core'
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

/**
 * https://docs.github.com/en/rest/reference/pulls#list-pull-requests-files
 * Todo update types
 *  */
async function getPullRequestFiles(
  octokitClient: Octokit
): Promise<Set<string>> {
  const pull_number = github.context.payload.pull_request?.number as number
  const response = await octokitClient.rest.pulls.listFiles({
    ...github.context.repo,
    pull_number,
    per_page: 99 // only support 99 files
  })
  return new Set(response.data.map(item => item.filename))
}

export async function annotateGithub(
  coverageFiles: CoverageFile[],
  githubToken: string
): Promise<unknown> {
  if (!githubToken) {
    throw Error('GITHUB_TOKEN is missing')
  }
  const pullRequest = github.context.payload.pull_request
  const ref = pullRequest
    ? pullRequest.head.ref
    : github.context.ref.replace('refs/heads/', '')

  const octokit = new Octokit({auth: githubToken})
  const pullRequestFiles = await getPullRequestFiles(octokit)
  core.info(JSON.stringify(pullRequestFiles))
  const annotations = coverageFiles.reduce((old, current) => {
    // Only annotate relevant files
    if (!pullRequestFiles.has(current.fileName)) return old
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
  core.info(JSON.stringify(annotations))
  const response = await octokit.rest.checks.create({
    ...github.context.repo,
    name: 'Annotate',
    head_sha: ref,
    status: 'completed',
    conclusion: 'success',
    output: {
      title: 'Coverage Tool',
      summary: 'Missing Coverage',
      annotations
    }
  })
  return response
}
