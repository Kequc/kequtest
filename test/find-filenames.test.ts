import assert from 'assert';
import fs from 'fs/promises';
import path from 'path';
import findFilenames from '../src/find-filenames';

const ABSOLUTE = path.join(__dirname, '/fake-src');
const EXTS = ['.fake-test.js'];

it('finds files', function () {
    const log = util.log();
    const result = findFilenames(log, ABSOLUTE, EXTS);
    assert.strictEqual(log.info.calls.length, 0);
    assert.deepStrictEqual(result, [
        path.join(ABSOLUTE, '/deep/other.fake-test.js'),
        path.join(ABSOLUTE, '/index.fake-test.js')
    ]);
});

it('finds files in a directory', function () {
    const log = util.log();
    const result = findFilenames(log, path.join(ABSOLUTE, '/deep'), EXTS);
    assert.strictEqual(log.info.calls.length, 0);
    assert.deepStrictEqual(result, [
        path.join(ABSOLUTE, '/deep/other.fake-test.js'),
    ]);
});

it('finds a specific test file', function () {
    const log = util.log();
    const result = findFilenames(log, path.join(ABSOLUTE, '/index.fake-test.js'), EXTS);
    assert.strictEqual(log.error.calls.length, 0);
    assert.deepStrictEqual(result, [
        path.join(ABSOLUTE, '/index.fake-test.js'),
    ]);
});

it('displays error when path is invalid', function () {
    const log = util.log();
    const result = findFilenames(log, path.join(ABSOLUTE, '/does-not-exist'), EXTS);
    assert.deepStrictEqual(result, []);
    assert.ok(log.error.calls[0][0] instanceof Error);
    assert.match(log.error.calls[0][0].message, /^Specified location doesn't exist/);
});

it('displays error when path is not a valid test file', function () {
    const log = util.log();
    const result = findFilenames(log, path.join(ABSOLUTE, 'index.js'), EXTS);
    assert.deepStrictEqual(result, []);
    assert.ok(log.error.calls[0][0] instanceof Error);
    assert.match(log.error.calls[0][0].message, /^Not a valid test file/);
});

it('displays error when path is node_modules', async function () {
    const log = util.log();
    try {
        await fs.mkdir(path.join(ABSOLUTE, '/node_modules'));
    } catch (error) {
        // just want to make sure it exists
    }
    const result = findFilenames(log, path.join(ABSOLUTE, '/node_modules'), EXTS);
    assert.deepStrictEqual(result, []);
    assert.ok(log.error.calls[0][0] instanceof Error);
    assert.match(log.error.calls[0][0].message, /^Not a valid test file/);
});
