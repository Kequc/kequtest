# <img alt="kequtest" src="https://github.com/Kequc/kequtest/raw/main/logo.png" width="190" height="85" />

A lightweight unit test runner using no dependencies. Useful for testing small projects, plugins, things like that quickly.

You don't need to configure anything to begin testing just run kequtest.

## Install

```
npm i -D kequtest
//or
npm i -g kequtest
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
* Runs all tests
* Displays errors

## Use

It finds all `.test.js` files in the current directory.

`describe`

`it`

Containers are defined using `describe` and tests are defined with `it`, a test will fail if an error is thrown. An easy way to throw errors is by using Node's [`assert`](https://nodejs.org/api/assert.html).

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

`before`

`beforeEach`

`afterEach`

`after`

They run in conjunction with the current block, using `beforeEach` inside a `describe` block will run once for each `it` inside.


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

`util.log`

Generate a pseudo `console` object where each method `debug`, `info`, `log`, `warn`, and `error` is a spy.

`util.spy`

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

`util.mock`

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

`util.mock.stop`

Stops mocking a specific target. Mocks are automatically stopped at the end of the current block.

`util.mock.stopAll`

Stops mocking all targets.

## Uncache

`util.uncache`

Clear a module from the cache, this will force the module to be loaded again the next time it is required.

Modules are automatically uncached at the end of the current block. This could be used manually if you wanted to uncache between, or during tests.

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

Tip if you want to avoid `no-undef` warnings add overrides to your eslint config.

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
