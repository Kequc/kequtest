const assert = require('assert');
const findFiles = require('../src/find-files.js');

const ABSOLUTE = __dirname + '/fake-src';
const EXTS = ['.fake-test.js'];

it('finds appropriate test files', function () {
    const log = util.log();
    const result = findFiles(log, ABSOLUTE, EXTS);
    assert.deepStrictEqual(log.info.calls.length, 0);
    assert.strictEqual(result.length, 2);
    assert.ok(result[0].endsWith('/test/fake-src/deep/other.fake-test.js'));
    assert.ok(result[1].endsWith('/test/fake-src/index.fake-test.js'));
});

it('finds files in a directory', function () {
    const log = util.log();
    const result = findFiles(log, ABSOLUTE + '/deep', EXTS);
    assert.strictEqual(log.info.calls.length, 0);
    assert.strictEqual(result.length, 1);
    assert.ok(result[0].endsWith('/test/fake-src/deep/other.fake-test.js'));
});

it('finds a specific test file', function () {
    const log = util.log();
    const result = findFiles(log, ABSOLUTE + '/index.fake-test.js', EXTS);
    assert.strictEqual(log.error.calls.length, 0);
    assert.strictEqual(result.length, 1);
    assert.ok(result[0].endsWith('/test/fake-src/index.fake-test.js'));
});

it('displays an error when path is invalid', function () {
    const log = util.log();
    const result = findFiles(log, ABSOLUTE + '/does-not-exist', EXTS);
    assert.strictEqual(result.length, 0);
    assert.ok(log.error.calls[0][0] instanceof Error);
    assert.match(log.error.calls[0][0].message, /^Specified location doesn't exist/);
});

it('displays an error when path is not a valid test file', function () {
    const log = util.log();
    const result = findFiles(log, ABSOLUTE + '/index.js', EXTS);
    assert.strictEqual(result.length, 0);
    assert.ok(log.error.calls[0][0] instanceof Error);
    assert.match(log.error.calls[0][0].message, /^Not a valid test file/);
});

it('displays an error when path is node_modules', function () {
    const log = util.log();
    const result = findFiles(log, ABSOLUTE + '/node_modules', EXTS);
    assert.strictEqual(result.length, 0);
    assert.ok(log.error.calls[0][0] instanceof Error);
    assert.match(log.error.calls[0][0].message, /^Not a valid test file/);
});
