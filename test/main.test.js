const assert = require('assert');
const main = require('../src/main.js');

const DIRECTORY = __dirname + '/fake-src';
const EXTS = ['.fake-test.js'];

it('sets up test environment', function () {
    assert.strictEqual(process.env.NODE_ENV, 'test');
    assert.strictEqual(typeof describe, 'function');
    assert.strictEqual(typeof it, 'function');
    assert.strictEqual(typeof before, 'function');
    assert.strictEqual(typeof beforeEach, 'function');
    assert.strictEqual(typeof afterEach, 'function');
    assert.strictEqual(typeof after, 'function');
});

it('builds and runs an entire test suite', async function () {
    const log = util.log();
    await main(log, DIRECTORY, EXTS);
    assert.deepStrictEqual(log.info.calls, [
        ['STARTING'],
        ['> ' + DIRECTORY],
        ['Found 2 test files...'],
        ['deep/other.fake-test.js'],
        ['index.fake-test.js'],
        ['FINISHED'],
        ['0/0 passing, 0 failures'],
        ['']
    ]);
});
