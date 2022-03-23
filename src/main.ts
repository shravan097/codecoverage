import * as core from '@actions/core'
import {annotateGithub, filterCoverageByFile, parseLCov} from './util'

async function run(): Promise<void> {
  try {
    core.info('Performing Code Coverage Analysis')
    const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN')
    const LCOV_FILE_PATH = core.getInput('LCOV_FILE_PATH')
    const parsedCov = await parseLCov(LCOV_FILE_PATH)
    const coverageByFile = filterCoverageByFile(parsedCov)
    await annotateGithub(coverageByFile, GITHUB_TOKEN)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
