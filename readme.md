# <img alt="kequtest" src="https://github.com/Kequc/kequtest/raw/main/logo.png" width="190" height="85" />

A very lightweight unit test runner using no dependencies. Useful for testing small projects, plugins, things like that. The goal is to be simple.

## Install

```
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

By default kequtest finds all test files recursively throughout the current directory and runs them. Test files should have `.test.js` as their extension, using `describe()` and `it()` blocks inside of them to organise. If an error is thrown the test fails.

The easiest way to throw errors is Node's [`assert`](https://nodejs.org/api/assert.html) library.

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

Output looks like this.

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

## Advanced use

You may specify a test or directory as a parameter.

```
kequc@kequ4k:~/my-project$ kequtest somewhere/my-lib.test.js
```

## Hooks

`before`

`beforeEach`

`afterEach`

`after`

They run in conjunction with the current block. So, at the top of a `describe` block, `beforeEach` will run once for each `it` inside the block.

## Spies

`util.log`

Generates a pseudo `console` object where every method `debug`, `info`, `log`, `warn`, and `error` are a spy.

`util.spy`

Takes a function to spy on as a parameter. Values that passed through it are available as an array on the `calls` attribute.

```javascript
const mySpy = util.spy(() => 'hi there');
const result = mySpy('hello?', 1);

// mySpy.calls ~= [['hello?', 1]]
// result ~= 'hi there'
```

## Mocks

`util.mock`

Called with a target and desired return value, mocks must be defined before their targets are imported. Targets are relative to your test.

```javascript
// /my-project/src/main-lib.js

module.exports = require('./my-data.js').getUser;
```
```javascript
// /my-project/tests/main-lib.test.js

util.mock('../src/my-data.js', {
    getUser: () => ({ id: 'fake-id', name: 'peter' })
});

const assert = require('assert');
const mainLib = require('../src/main-lib.js');

it('uses mock', function () {
    const result = mainLib();
    assert.strictEqual(result.id, 'fake-id');
});
```

`util.mock.stop`

Stops mocking a specific target. Mocks are automatically stopped at the end of the current block. 

`util.mock.stopAll`

Stops mocking all modules.

## Uncache

`util.uncache`

Clear a module from the cache at a given target, this will force the module to be loaded again when it is needed.

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
