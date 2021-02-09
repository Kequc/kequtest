const assert = require('assert');
const main = require('../src/main.js');

it('sets up test environment', function () {
    assert.strictEqual(process.env.NODE_ENV, 'test');
    assert.strictEqual(typeof describe, 'function');
    assert.strictEqual(typeof it, 'function');
    assert.strictEqual(typeof before, 'function');
    assert.strictEqual(typeof beforeEach, 'function');
    assert.strictEqual(typeof afterEach, 'function');
    assert.strictEqual(typeof after, 'function');
});

describe('describe', function () {
    it('throws an error when description is invalid', function () {
        assert.throws(() => { describe(); }, { message: /^Description must be a string/ });
        assert.throws(() => { describe(null); }, { message: /^Description must be a string/ });
        assert.throws(() => { describe(100); }, { message: /^Description must be a string/ });
    });
    it('throws an error when callback is invalid', function () {
        assert.throws(() => { describe('testing'); }, { message: /^Callback must be a function/ });
        assert.throws(() => { describe('testing', null); }, { message: /^Callback must be a function/ });
        assert.throws(() => { describe('testing', 100); }, { message: /^Callback must be a function/ });
    });
});

describe('it', function () {
    it('throws an error when description is invalid', function () {
        assert.throws(() => { it(); }, { message: /^Description must be a string/ });
        assert.throws(() => { it(null); }, { message: /^Description must be a string/ });
        assert.throws(() => { it(100); }, { message: /^Description must be a string/ });
    });
    it('throws an error when callback is invalid', function () {
        assert.throws(() => { it('testing', null); }, { message: /^Callback must be a function/ });
        assert.throws(() => { it('testing', 100); }, { message: /^Callback must be a function/ });
    });
});

it('runs test suite', async function () {
    const log = util.log();
    const absolute = __dirname + '/fake-src';
    const exts = ['.fake-test.js'];

    await main(log, absolute, exts);

    assert.deepStrictEqual(log.info.calls, [
        ['STARTING'],
        ['> ' + absolute],
        ['Found 2 test files...'],
        ['deep/other.fake-test.js'],
        ['index.fake-test.js'],
        ['FINISHED'],
        ['0/0 passing, 0 failures'],
        ['']
    ]);
});
