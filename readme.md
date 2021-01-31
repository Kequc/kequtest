# kequtest

A very simple lightweight unit test runner using zero dependencies. Useful for testing small projects, plugins, things like that.

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

## Hooks

You may use hooks to further organise your tests. Available hooks are `before` `beforeEach` `afterEach` `after`, they run in conjunction with the current block. So, at the top of the file `beforeEach` will run once for each `describe` or `it` which is a direct sibling to itself.

## Example

```javascript
// /my-project/somewhere/my-lib.test.js
const assert = require('assert');
const myLib = require('./my-lib.js');

it('counts nearby offices', function () {
    const result = myLib();
    assert.equal(result, 42);
});
```

Output looks like this.

```
kequc@kequ4k:~/my-project$ npm t

STARTING
Found 1 test file...
my-lib.test.js
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

## Eslint

Tip if you want to avoid no-undef errors add overrides to your eslint config.

```json
{
  "overrides": [
    {
      "files": ["*.test.js"],
      "globals": {
        "describe": "readonly",
        "it": "readonly",
        "before": "readonly",
        "beforeEach": "readonly",
        "afterEach": "readonly",
        "after": "readonly",
      }
    }
  ]
}
```
