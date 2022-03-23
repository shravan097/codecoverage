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
/** input: dist/index.test.ts --> output: index */
function getFileNameFirstItemFromPath(path: string): string | undefined {
  const rawFileName = path?.split('/')?.pop()
  return rawFileName?.split('.')?.[0]
}

/**
 * https://docs.github.com/en/rest/reference/pulls#list-pull-requests-files
 * Todo update types
 *  */
async function getPullRequestFiles(
  octokitClient: Octokit
): Promise<Set<string>> {
  const pull_number = github.context.issue.number
  const response = await octokitClient.rest.pulls.listFiles({
    ...github.context.repo,
    pull_number
  })
  core.info(`Pull Request Files Length: ${response.data.length}`)
  const mySet = new Set<string>()
  for (const item of response.data) {
    const fileNameFirstItem = getFileNameFirstItemFromPath(item?.filename)
    if (fileNameFirstItem) mySet.add(fileNameFirstItem)
  }
  core.info(`Filename as a set ${mySet.size}`)
  core.info(JSON.stringify(Array.from(mySet)?.splice(0, 10)))
  return mySet
}
type Annotations = {
  path: string,
  start_line: number,
  end_line: number,
  start_column: number,
  end_column: number,
  annotation_level: string,
  message: string
}
export async function annotateGithub(
  coverageFiles: CoverageFile[],
  githubToken: string
): Promise<unknown> {
  if (!githubToken) {
    throw Error('GITHUB_TOKEN is missing')
  }
  const pullRequest = github.context.payload.pull_request
  core.info(`Coverage files length ${coverageFiles?.length}`)
  core.info(JSON.stringify(coverageFiles?.splice(0, 10)))
  core.info(`Pull request number ${github.context.issue.number}`)
  const ref = pullRequest
    ? pullRequest.head.ref
    : github.context.ref.replace('refs/heads/', '')

  const octokit = new Octokit({auth: githubToken})
  const pullRequestFiles = await getPullRequestFiles(octokit)
  const logs: Object[] = []
  const annotations: Annotations[] = []
  for (const current of coverageFiles) {
    // Only annotate relevant files
    const log = {}
    const fileNameFirstItem = getFileNameFirstItemFromPath(current?.fileName)
    log['fileName'] = fileNameFirstItem
    if (fileNameFirstItem && pullRequestFiles.has(fileNameFirstItem)) {
      current.missingLineNumbers.map(lineNumber => {
        annotations.push({
          path: current.fileName,
          start_line: lineNumber,
          end_line: lineNumber,
          start_column: 1,
          end_column: 1,
          annotation_level: 'warning',
          message: 'this line is not covered by test'
        })
      })
      log['missingNumbers'] = current.missingLineNumbers.length
      log['annotationsSize'] = annotations.length
    }
    logs.push(log)
  }
  core.info(JSON.stringify(logs))
  core.info(`Annotation count: ${annotations.length}`)
  core.info(JSON.stringify(annotations.splice(0, 5)))
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
  core.info(response.data.output.annotations_url)
  return response
}
