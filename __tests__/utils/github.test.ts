import {test} from '@jest/globals'
import {GithubUtil} from '../../src/utils/github'

test('github init successfully', async function () {
  const githubUtil = new GithubUtil('1234')
  expect(githubUtil).toBeInstanceOf(GithubUtil)
})

test('github init to throw error', function () {
  expect(() => new GithubUtil('')).toThrowError('GITHUB_TOKEN is missing')
})

// @todo test for rest of github class
