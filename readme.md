# <img alt="kequtest" src="https://github.com/Kequc/kequtest/raw/main/logo.png" width="190" height="85" />

A lightweight unit test runner using no dependencies. It's meant to run fast and be useful for testing small projects, plugins, things like that quickly.

You don't need to configure anything to begin testing just run kequtest.

## Install

```
npm i -D kequtest
```

Add the following script to `package.json` for easier access:

```javascript
{
  "scripts": {
    "test": "kequtest"
  }
}
```

## Features

* Supports async tests
* Use any mechanism for thowing errors
* Supports Typescript
* Runs all tests
* Displays logs on failed tests
* Displays errors

## Use

It finds all `.test.js` files anywhere in the current directory.

`describe()`

`it()`

Containers are defined using `describe()` and tests are defined with `it()`, a test will fail if an error is thrown. An easy way to throw errors is by using Node's [`assert`](https://nodejs.org/api/assert.html).

## Example

```javascript
// /my-project/somewhere/my-lib.test.js

const assert = require('assert');
const myLib = require('./my-lib.js');

it('counts nearby offices', function () {
  const result = myLib();
  assert.strictEqual(result, 42);
});
```

Output will look like this.

```
kequc@kequ4k:~/my-project$ npm t

STARTING

> /home/kequc/my-project
Found 1 test file...

somewhere/my-lib.test.js
· counts nearby offices ✓

FINISHED
1/1 passing, 0 failures

kequc@kequ4k:~/my-project$
```

## Advanced

You may specify a file or directory as a parameter.

```
kequtest somewhere/my-lib.test.js
```

## Hooks

`before()`

`beforeEach()`

`afterEach()`

`after()`

They run in conjunction with the current container, using `beforeEach()` will run once for each `it()` inside.


```javascript
let count = 0;

beforeEach(function () {
  count++;
});

it('uses hooks', function () {
  // count ~= 1
});
```

## Spies

`util.logger()`

Generate a `console`-like object where each method `debug`, `info`, `log`, `warn`, and `error` is a spy.

`util.spy()`

Takes a function to spy on (or empty). Values that pass through are available as an array on the `calls` attribute.

```javascript
const mySpy = util.spy(() => 'hi there');
const result = mySpy('hello?', 1);
// result ~= 'hi there'
// mySpy.calls ~= [['hello?', 1]]

mySpy.reset();
// mySpy.calls ~= []
```

## Mocks

`util.mock()`

Called with a target and desired return value, mocks must be defined before their targets are imported. Targets are relative to your test.

```javascript
// /my-project/src/main-lib.js

module.exports = require('./my-data.js').getUser();
```
```javascript
// /my-project/tests/main-lib.test.js

util.mock('../src/my-data.js', {
  getUser: () => ({ id: 'fake-id', name: 'peter' })
});

const { id } = require('../src/main-lib.js');

it('mocks', function () {
  // id ~= 'fake-id'
});
```

`util.mock.stop()`

Stops mocking a specific target. Mocks are automatically stopped at the end of the current container.

`util.mock.stopAll()`

Stops mocking all targets.

## Uncache

`util.uncache()`

Clear a module from the cache, this will force the module to be loaded again the next time it is required.

Modules are automatically uncached at the end of the current container. This could be used manually if you wanted to uncache between, or during tests.

```javascript
let mainLib;

beforeEach(function () {
  mainLib = require('../src/main-lib.js');
});

afterEach(function () {
  util.uncache('../src/main-lib.js');
});
```

## Eslint

Tip if you aren't using TypeScript and want to avoid `no-undef` warnings add overrides to your eslint config.

```json
{
  "overrides": [
    {
      "files": ["*.test.js"],
      "globals": {
        "describe": "readonly",
        "it": "readonly",
        "util": "readonly",
        "before": "readonly",
        "beforeEach": "readonly",
        "afterEach": "readonly",
        "after": "readonly"
      }
    }
  ]
}
```

## TypeScript

If you want to test a TypeScript project or your tests are written in TypeScript. Use `kequtest` with the `--ts` flag, this will automatically register `ts-node` and look for `.test.ts` files.

Ensure you have both [`typescript`](https://www.npmjs.com/package/typescript) and [`ts-node`](https://www.npmjs.com/package/ts-node) installed in your project.

```
{
  "scripts": {
    "test": "kequtest --ts"
  }
}
```

To enjoy types you should create a `kequtest.d.ts` file or similar in the root of your project with the following added to it.

```
/// <reference types="kequtest" />
```

## Contribute

If you know how to better implement TypeScript so globals like `beforeEach` can be used via intellisense in tests I'd love to hear from you. I feel the current implementation requiring an additional type definition file is not the best. It's also confusing as it causes methods exposed by kequtest to appear via intellisense in every file of the project, not just test files.

A better TypeScript implementation is warmly welcomed.
