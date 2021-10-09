import assert from 'assert';
import path from 'path';
import main from '../src/main';

it('sets up test environment', function () {
    assert.strictEqual(process.env.NODE_ENV, 'test');
    assert.strictEqual(typeof describe, 'function');
    assert.strictEqual(typeof it, 'function');
    assert.strictEqual(typeof before, 'function');
    assert.strictEqual(typeof beforeEach, 'function');
    assert.strictEqual(typeof afterEach, 'function');
    assert.strictEqual(typeof after, 'function');
});

it('runs test suite', async function () {
    const log = util.log();
    const absolute = path.join(__dirname, '/fake-src');
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
