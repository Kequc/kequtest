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

it('returns utility functions', function () {
    assert.strictEqual(typeof util.mock, 'function');
    assert.strictEqual(typeof util.mock.stop, 'function');
    assert.strictEqual(typeof util.mock.stopAll, 'function');
    assert.strictEqual(typeof util.uncache, 'function');
    assert.strictEqual(typeof util.spy, 'function');
    assert.strictEqual(typeof util.logger, 'function');
});

it('runs test suite', async function () {
    const logger = util.logger();
    const absolute = path.join(__dirname, '/fake-src');
    const exts = ['.fake-test.js'];

    await main(logger, [absolute], exts);

    assert.deepStrictEqual(logger.info.calls.map(call => call[0]), [
        'STARTING',
        '',
        '> ' + absolute,
        'Found 2 test files...',
        '',
        '/test/fake-src/deep/other.fake-test.js',
        '',
        '/test/fake-src/index.fake-test.js',
        '',
        'FINISHED',
        '0/0 passing, 0 failures',
        ''
    ]);
});
