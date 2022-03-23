import {test} from '@jest/globals'
import {parseLCov, filterCoverageByFile, annotateGithub} from '../src/util'
const sampleParsedCov = [
  {
    lines: {
      found: 6,
      hit: 4,
      details: [
        {
          line: 1,
          hit: 1
        },
        {
          line: 2,
          hit: 1
        },
        {
          line: 5,
          hit: 1
        },
        {
          line: 6,
          hit: 0
        },
        {
          line: 9,
          hit: 1
        },
        {
          line: 10,
          hit: 0
        }
      ]
    },
    functions: {
      hit: 0,
      found: 2,
      details: [
        {
          name: '(anonymous_2)',
          line: 6,
          hit: 0
        },
        {
          name: '(anonymous_3)',
          line: 9,
          hit: 0
        }
      ]
    },
    branches: {
      hit: 0,
      found: 0,
      details: []
    },
    title: '',
    file: 'src/app.controller.ts'
  },
  {
    lines: {
      found: 4,
      hit: 0,
      details: [
        {
          line: 1,
          hit: 0
        },
        {
          line: 2,
          hit: 0
        },
        {
          line: 3,
          hit: 0
        },
        {
          line: 10,
          hit: 0
        }
      ]
    },
    functions: {
      hit: 0,
      found: 0,
      details: []
    },
    branches: {
      hit: 0,
      found: 0,
      details: []
    },
    title: '',
    file: 'src/app.module.ts'
  },
  {
    lines: {
      found: 3,
      hit: 2,
      details: [
        {
          line: 1,
          hit: 1
        },
        {
          line: 4,
          hit: 1
        },
        {
          line: 6,
          hit: 0
        }
      ]
    },
    functions: {
      hit: 0,
      found: 1,
      details: [
        {
          name: '(anonymous_1)',
          line: 5,
          hit: 0
        }
      ]
    },
    branches: {
      hit: 0,
      found: 0,
      details: []
    },
    title: '',
    file: 'src/app.service.ts'
  },
  {
    lines: {
      found: 5,
      hit: 0,
      details: [
        {
          line: 1,
          hit: 0
        },
        {
          line: 2,
          hit: 0
        },
        {
          line: 5,
          hit: 0
        },
        {
          line: 6,
          hit: 0
        },
        {
          line: 8,
          hit: 0
        }
      ]
    },
    functions: {
      hit: 0,
      found: 1,
      details: [
        {
          name: 'bootstrap',
          line: 4,
          hit: 0
        }
      ]
    },
    branches: {
      hit: 0,
      found: 0,
      details: []
    },
    title: '',
    file: 'src/main.ts'
  }
] as any
test('main', async () => {
  console.log('testing')
})

test('filterCoverageByFile', function () {
  const x = filterCoverageByFile(sampleParsedCov)
  console.log(JSON.stringify(x, null, 2))
})



// test('annotateGithub', async function () {
//   const j = await annotateGithub('' as any, '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')
// })
