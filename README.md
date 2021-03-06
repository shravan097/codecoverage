[![Coverage Status](https://coveralls.io/repos/github/shravan097/codecoverage/badge.svg?branch=main)](https://coveralls.io/github/shravan097/codecoverage?branch=main)

![Build Status](https://github.com/shravan097/codecoverage/actions/workflows/test.yml/badge.svg)

# Code Coverage Annotation 

Generate code coverage annotation in pull request within Github Action Workflow environment. No data is sent to an external server.

**NOTE**: 
- Test file and code file name should be same. (ie. `index.ts` should have test file named `index.test.ts`, the test file may exist in any directory)
- You must invoke the function/class at least once. 

## Sample PR Annotation
<img width="1069" alt="Screen Shot 2022-06-26 at 7 11 21 PM" src="https://user-images.githubusercontent.com/23582455/175847244-dbed2fb3-70be-4bcd-a7d0-64197951c517.png">


## Inputs


| Key              | Required | Default | Description                                                                                           |
| ---------------- | -------- | ------- | ----------------------------------------------------------------------------------------------------- |
| `GITHUB_TOKEN`   | **yes**  | -       | Github Token generated by Github Action workflow. You can pass this in as `${{secrets.GITHUB_TOKEN}}` |
| `LCOV_FILE_PATH` | **yes**  | -       | Location of Lcov.info file that was generatedcommand                                                  |

## Example
```yaml
- name: Code Coverage Annotation Line by Line
  uses: shravan097/codecoverage@release/v0.5.1
  with:
    GITHUB_TOKEN: ${{secrets.GITHUB_TOKEN}}
    LCOV_FILE_PATH: "./coverage/lcov.info"
```

## Code in Main

> First, you'll need to have a reasonably modern version of `node` handy. This won't work with versions older than 9, for instance.

Install the dependencies  
```bash
$ npm install
```

Build the typescript and package it for distribution
```bash
$ npm run build && npm run package
```

Run the tests :heavy_check_mark:  
```bash
$ npm test
...
```


## Publish to a distribution branch

Actions are run from GitHub repos so we will checkin the packed dist folder. 

Then run [ncc](https://github.com/zeit/ncc) and push the results:
```bash
$ npm run package
$ git add dist
$ git commit -a -m "prod dependencies"
$ git push origin releases/v1
```

Note: We recommend using the `--license` option for ncc, which will create a license file for all of the production node modules used in your project.

Your action is now published! :rocket: 

See the [versioning documentation](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)

## Validate

You can now validate the action by referencing `./` in a workflow in your repo (see [test.yml](.github/workflows/test.yml))

```yaml
uses: ./
with:
  GITHUB_TOKEN: ${{secrets.GITHUB_TOKEN}}
  LCOV_FILE_PATH: "./coverage/lcov.info"
```

See the [actions tab](https://github.com/actions/typescript-action/actions) for runs of this action! :rocket:
