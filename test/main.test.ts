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
    assert.strictEqual(typeof util.log, 'function');
});

it('runs test suite', async function () {
    const log = util.log();
    const absolute = path.join(__dirname, '/fake-src');
    const exts = ['.fake-test.js'];

    await main(log, [absolute], exts);

    const line = (index: number) => log.info.calls[index][0];
    const desc = (relative: string) =>
        '\n' + path.join(absolute, relative).replace(process.cwd(), '');

    assert.strictEqual(line(0), 'STARTING');
    assert.strictEqual(line(2), '> ' + absolute);
    assert.strictEqual(line(3), 'Found 2 test files...');
    assert.strictEqual(line(4), desc('deep/other.fake-test.js'));
    assert.strictEqual(line(5), desc('index.fake-test.js'));
    assert.strictEqual(line(7), 'FINISHED');
    assert.strictEqual(line(8), '0/0 passing, 0 failures');
});
