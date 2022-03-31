import {test} from '@jest/globals'

import {getFileNameFirstItemFromPath} from '../../src/utils/general'
test.only('getFileNameFirstItemFromPath', function () {
  const testCases = [
    {
      input: 'a/b/c.test.ts',
      output: 'c'
    },
    {
      input: 'd.ts',
      output: 'd'
    },
    {
      input: '',
      output: undefined
    },
    {
      input: 'a/b/c',
      output: undefined
    }
  ]
  testCases.forEach(test => {
    expect(getFileNameFirstItemFromPath(test.input))
  })
})
