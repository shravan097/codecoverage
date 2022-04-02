import * as core from '@actions/core'
import * as github from '@actions/github'
import {filterCoverageByFile, parseLCov} from './utils/lcov'
import {GithubUtil} from './utils/github'

/** Starting Point of the Github Action*/
export async function play(): Promise<void> {
  try {
    if (github.context.eventName !== 'pull_request') {
      core.info('Pull request not detected. Exiting early.')
      return
    }
    core.info('Performing Code Coverage Analysis')
    const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN')
    const LCOV_FILE_PATH = core.getInput('LCOV_FILE_PATH')

    if (!GITHUB_TOKEN || !LCOV_FILE_PATH) {
      throw new Error('Required Inputs not provided')
    }

    // 1. Parse coverage file
    const parsedCov = await parseLCov(LCOV_FILE_PATH)
    core.info('Parsing done')
    // 2. Filter Coverage By File Name
    const coverageByFile = filterCoverageByFile(parsedCov)
    core.info('Filter done')
    const githubUtil = new GithubUtil(GITHUB_TOKEN)
    // 3. Get current pull request files
    const pullRequestFiles = await githubUtil.getPullRequestFiles()
    const annotations = githubUtil.buildAnnotations(
      coverageByFile,
      pullRequestFiles
    )
    // 4. Annotate in github
    await githubUtil.annotate({
      referenceCommitHash: githubUtil.getPullRequestRef(),
      annotations
    })
    core.info('Annotation done')
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
    core.info(JSON.stringify(error))
  }
}
