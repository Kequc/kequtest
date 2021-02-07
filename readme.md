# <img alt="kequtest" src="https://github.com/Kequc/kequtest/raw/main/logo.png" width="190" height="85" />

A very lightweight unit test runner using zero dependencies. Useful for testing small projects, plugins, things like that.

## Install

```
npm i -g kequtest
```

Add the following script to `package.json` for easy access:

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

By default kequtest will find all test files recursively throughout the entire project and run them. Test files should have `.test.js` as their extension, and use `it()` and `describe()` blocks to organise. If an error is thrown the test fails.

The easiest way to throw errors is to use Node's built in `assert` library.

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

You may specify a test file or directory as a parameter.

```
kequc@kequ4k:~/my-project$ kequtest somewhere/my-lib.test.js
```

## Hooks

Available hooks are `before`, `beforeEach`, `afterEach`, and `after`. They run in conjunction with the current block. So, at the top of a `describe` block, `beforeEach` will run once for each `it` inside the block.

## Spies

Rudimentary spying can be found at `util.spy` where the parameter given is a function to spy on, if you want to know what your spy was called with use `calls`.

```javascript
const mySpy = util.spy(() => 'hi there');
const result = mySpy('hello?', 1);

// mySpy.calls ~= [['hello?', 1]]
// result ~= 'hi there'
```

There is a simple `util.log` method which just generates a pseudo `console` object where every method `debug`, `info`, `log`, `warn`, and `error` is a spy.

## Mocks

Mocks can be created using `util.mock` before `require`, it takes a target and return value. Targets are relative to your test.

```javascript
// /my-project/src/main-lib.js
module.exports = require('./my-data.js').getUser;
```
```javascript
// /my-project/test/main-lib.test.js
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

To stop mocking use `util.mock.stop(target)` or `util.mock.stopAll()`. Mocks are automatically stopped at the end of the current block. 

## Uncache

Clear a module from node's cache using `util.uncache(target)` causing it to load next time it's required.

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
