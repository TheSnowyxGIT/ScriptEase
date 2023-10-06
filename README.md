[![NPM version](https://badge.fury.io/js/scriptease-cli.svg)](http://badge.fury.io/js/scriptease-cli)
[![Coverage Status](https://coveralls.io/repos/github/TheSnowyxGIT/ScriptEase/badge.svg?branch=master)](https://coveralls.io/github/TheSnowyxGIT/ScriptEase?branch=master)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

ScriptEase is a powerful tool that allows for easy management and execution of npm scripts, written in JavaScript, on any operating system, enabling the creation of complex scripts

> This is a beta version of ScriptEase. A stable and complete version with features such as variables, hooks, better parameters, more flexibility, and more useful built-in commands is coming soon. Users are encouraged to submit any issues they encounter on the project's GitHub page.

> Additionally, the log system will be upgraded to be more simple and flexible, with different levels of logs.

## Table of content

- [Table of content](#table-of-content)
- [Installation](#installation)
- [Getting Started](#getting-started)
- [Run Cycle Overview](#run-cycle-overview)
- [Async / Await](#async--await)
- [Hooks](#hooks)
- [Dynamically generate script](#dynamically-generate-script)
- [Runners](#runners)
- [Script Throw system](#script-throw-system)
- [Leaves Payload](#leaves-payload)
- [Use Typescript](#use-typescript)
- [Command line usage](#command-line-usage)
  - [Options](#options)
    - [**--file \<file1\> ... \<fileN\>**](#--file-file1--filen)
    - [**--directory \<dir1\> ... \<dirN\>**](#--directory-dir1--dirn)
    - [**--require \<module1\> ... \<moduleN\>**](#--require-module1--modulen)

## Installation

Install using _npm_:

```sh
npm install --save-dev scriptease-cli
```

_npm_ is the only package manager yet supported.

## Getting Started

```sh
npm install --save-dev scriptease-cli
mkdir scripts
touch seconfig.json scripts/all.script.js
$EDITOR scripts/all.script.js
$EDITOR seconfig.json
```

Writing up your first script:

- scritps/all.script.js

  ```js
  const { leaf } = require('scriptease-cli');

  leaf('ping', () => {
    console.log('Pong!');
  });
  ```

- seconfig.json

  ```json
  {
    "directories": ["scripts"]
  }
  ```

Back in the terminal:

```sh
$ npx se run ping
# or
$ npx se run ping -d scripts # if the seconfig.json is no set

# Logs messages...

Pong!

# Logs messages...
```

Set up your script in package.json:

```json
"scripts": {
    "ping": "se ping"
}
```

> In a future version, there will be no need to specify the script to execute inside the package.json.
>
> ```json
> "scripts": {
>    "ping": "se"
> }
> ```

Then run your script:

```sh
npm run ping
```

## Run Cycle Overview

1. User (you) executes ScriptEase (se run).
2. ScriptEase loads options from the config file (seconfig.json) and checks the validity of the given options.
3. ScriptEase gets args options given by the user in the command line and overwrites/adds them to the merged options.
4. ScriptEase searches for the scripts files:
   1. ScriptEase searches for all .script.js files inside the given directories.
   2. ScriptEase adds the files directly given inside the config (seconfig.json) and in the args.
5. ScriptEase builds the scripts Tree from the scripts files.
6. ScriptEase gets the identifier (script name) given by the user and searches if the script exists inside the built tree.
7. If the script exists, ScriptEase executes the script.
8. At the end of the execution, ScriptEase shows the status of the execution.

## Async / Await

You can (and it is advise) use asynchronous, like this:

```js
leaf('test', async () => {
  const resultParser = await runner.run('test:parser');
  const resultExecutor = await runner.run('test:executor');
  // ...
});
```

## Hooks

Hooks are functions that are executed before or after a script.

```js
beforeEach(async () => {
  // ...
});
afterEach(async () => {
  // ...
});
beforeAll(async () => {
  // ...
});
```

## Dynamically generate script

Given ScriptEase’s use of function expressions to define suites and test cases, it’s straightforward to generate your scripts dynamically. No special syntax is required which you may have seen in other frameworks like mocha.

```js
branch('test', () => {
  const components = ['parser', 'ast', 'executor', 'logger'];

  for (const component of components) {
    leaf(component, async () => {
      console.log(`Running unit tests for '${component}'`);
      await runner.npxExec('mocha', [`tests/${component}/**/*.spec.js`]); // will throw if mocha exit code != 0
    });
  }
});
```

## Runners

The runner interface can be accessible as follow:

```js
const { runner } = require('scriptease-cli');
```

This interface gives you some useful function to execute other scripts or shell commands.

Functions:

- `run(identifier: string): Promise<Result>`
- `runCatch(identifier: string): Promise<Result>`
- `runAllStopOnFailure(identifiers: string[]): Promise<MultipleResult<Result>>`
- `runAllStopOnFailureCatch(identifiers: string[]): Promise<MultipleResult<Result>>`
- `runAllIgnoreFailure(identifiers: string[]): Promise<MultipleResult<Result>>`
- `runAllIgnoreFailureCatch(identifiers: string[]): Promise<MultipleResult<Result>>`
- `exec(cmd: string, config: ExecConfig = {}): Promise<ExecResult>`
- `npxExec(cmd: string, args: string[] = [], options: NpxExecOption[] = [], config: NpxExecConfig = {}): Promise<ExecResult>`

example :

```js
leaf('test', async () => {
  await runner.run('test:unit'); // will throw if the 'test:unit' script has thrown
  const result = await runner.runCatch('test:integration'); // will not throw even if the 'test:unit' script has thrown
  console.log(result.isOK()); // 'true' if the sub script didn't throw, 'false' otherwise.
});

branch('test', () => {
  leaf('unit', async () => {
    await runner.npxExec('mocha', ...); // will throw if mocha fail
  });
  leaf('integration', async () => {
    await runner.exec('./myIntegrationScript.sh', ...); // will throw if the command fail
  });
});
```

example with suites :

```js
leaf('test', async () => {
  await runner.runAllStopOnFailure(['test:unit', 'test:integration']); // will throw, and 'test:integration' will not be executed
  await runner.runAllIgnoreFailure(['test:unit', 'test:integration']); // will execute the two script and throw after
});

branch('test', () => {
  leaf('unit', async () => {
    throw new Error('');
  });
  leaf('integration', async () => {
    // ...
  });
});
```

## Script Throw system

The script leaves have a custom error handler.

```js
leaf('all', async () => {
  const result = await runner.runCatch('1');
  console.log(result.getError()); // 1;

  // or (do the same)

  try {
    const result = await runner.run('1');
  } catch (result) {
    console.log(result.getError()); // 1;
  }
});

leaf('1', async () => {
  throw 1;
});
```

throw a Result :

```js
leaf('all', async () => {
  const result = await runner.runCatch('1');
  console.log(result.getCmd()); // 'unknown_command';
  console.log(result.getCode()); // 127;
});

leaf('1', async () => {
  await runner.exec('unknown_command'); // throw
});
```

## Leaves Payload

Your scripts can return values.

Basic example:

```js
leaf('script1', async => {
  const result1 = await runner.run('script2');
  const result2 = await runner.run('script3');
  console.log(result1.getPayload()); // 5
  console.log(result2.getPayload().key1); // Hello
});
leaf('script2', async => {
  return 5;
});
leaf('script3', async => {
  return {key1: 'Hello'}
});
```

Advanced example:

```js
leaf('cover', async () => {
  const multipleResult = await runner.runAllIgnoreFailureCatch(['cover:parser', 'cover:logger']);
  const paths = multipleResult.getResults().map((result) => result.getPayload());
  console.log(paths); // ['./cover/parser', './cover/logger']
  // merge all cover reports and show the final coverage
  // ...
  if (multipleResult.isKO()) throw multipleResult;
});

branch('cover', () => {
  leaf('parser', async () => {
    const reportPath = './cover/parser';
    const result = await runner.npxExec('nyc', ... , { crash: false }); // 'crash' have been set to false for stopping the function to throw
    result.setPayload(reportPath);
    if (result.isKO()) throw result;
    return result;
  });
  leaf('logger', async () => {
    const reportPath = './cover/logger';
    const result = await runner.npxExec('nyc', ... , { crash: false });
    result.setPayload(reportPath);
    if (result.isKO()) throw result;
    return result;
  });
});
```

## Use Typescript

By default, scriptEase will not be able to load your typescript files. But you can make this possible by loading a module that will compile your typescript files on the fly.

For example, you can use [ts-node](https://www.npmjs.com/package/ts-node) :

```sh
npm install -D ts-node
npx se run -r ts-node/register ...
```

## Command line usage

```sh
npx se --help # Show the main help
#npx se <cmd> --help # Show the help of a specific command
npx se run --help # Show the run command help
```

### Options

#### **--file \<file>**

> Alias: **-f**

Load the given file.

#### **--directory \<dir>**

> Alias: **-d**

Load all the files in the given directories. files must have the following extension: .script.js or .script.ts

> By default, scriptEase is not able to load Typescript files. [Use Typescript](#use-typescript)

#### **--require \<module>**

> Alias: **-r**

Require the given module before running.
