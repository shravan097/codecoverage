import {test} from '@jest/globals'
import {filterCoverageByFile, parseLCov} from '../../src/utils/lcov'
import {getFixturePath} from '../fixtures/util'

test('should parse lCov file', async function () {
  const path = getFixturePath('lcov.info')
  const output = await parseLCov(path)
  expect(output).toMatchSnapshot()
})

test('should throw err if lCov file path is not given', async function () {
  await expect(parseLCov('')).rejects.toThrow('No LCov path provided')
})

test('filterCoverageByFile', async function () {
  const path = getFixturePath('lcov.info')
  const parsedLcov = await parseLCov(path)
  const output = filterCoverageByFile(parsedLcov)
  expect(output).toMatchSnapshot()
})
