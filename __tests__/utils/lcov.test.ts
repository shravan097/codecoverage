import {test} from '@jest/globals'
import { parseLCov } from '../../src/utils/lcov'
import {getFixturePath} from '../fixtures/util'

test.only('should parse lCov file', async function () {
  const path = getFixturePath('lcov.info')
  const output = await parseLCov(path)
  expect(output).toMatchSnapshot()
})

xtest('should throw err if lCov file path is not given', async function () {
  await expect(parseLCov('')).rejects.toThrow('No LCov path provided')
})

xtest('filterCoverageByFile', function () {

})

