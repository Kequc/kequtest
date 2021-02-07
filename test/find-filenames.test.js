const assert = require('assert');
const findFilenames = require('../src/find-filenames.js');

const ABSOLUTE = __dirname + '/fake-src';
const EXTS = ['.fake-test.js'];

it('finds files', function () {
    const log = util.log();
    const result = findFilenames(log, ABSOLUTE, EXTS);
    assert.strictEqual(log.info.calls.length, 0);
    assert.deepStrictEqual(result, [
        ABSOLUTE + '/deep/other.fake-test.js',
        ABSOLUTE + '/index.fake-test.js'
    ]);
});

it('finds files in a directory', function () {
    const log = util.log();
    const result = findFilenames(log, ABSOLUTE + '/deep', EXTS);
    assert.strictEqual(log.info.calls.length, 0);
    assert.deepStrictEqual(result, [
        ABSOLUTE + '/deep/other.fake-test.js',
    ]);
});

it('finds a specific test file', function () {
    const log = util.log();
    const result = findFilenames(log, ABSOLUTE + '/index.fake-test.js', EXTS);
    assert.strictEqual(log.error.calls.length, 0);
    assert.deepStrictEqual(result, [
        ABSOLUTE + '/index.fake-test.js',
    ]);
});

it('displays error when path is invalid', function () {
    const log = util.log();
    const result = findFilenames(log, ABSOLUTE + '/does-not-exist', EXTS);
    assert.deepStrictEqual(result, []);
    assert.ok(log.error.calls[0][0] instanceof Error);
    assert.match(log.error.calls[0][0].message, /^Specified location doesn't exist/);
});

it('displays error when path is not a valid test file', function () {
    const log = util.log();
    const result = findFilenames(log, ABSOLUTE + '/index.js', EXTS);
    assert.deepStrictEqual(result, []);
    assert.ok(log.error.calls[0][0] instanceof Error);
    assert.match(log.error.calls[0][0].message, /^Not a valid test file/);
});

it('displays error when path is node_modules', function () {
    const log = util.log();
    const result = findFilenames(log, ABSOLUTE + '/node_modules', EXTS);
    assert.deepStrictEqual(result, []);
    assert.ok(log.error.calls[0][0] instanceof Error);
    assert.match(log.error.calls[0][0].message, /^Not a valid test file/);
});
