const assert = require('assert');
const JobSuite = require('../../src/jobs/job-suite.js');

const ABSOLUTE = __dirname + '/fake-src';
const FILES = [
    ABSOLUTE + '/deep/other.fake-test.js',
    ABSOLUTE + '/index.fake-test.js'
];

let parentHooks;
let originalKequtest;

beforeEach(function () {
    parentHooks = { beforeEach: [], afterEach: [] };
    originalKequtest = Object.assign({}, global.kequtest);
    global.kequtest = { filename: null, container: null };
});

afterEach(function () {
    // Make sure we're unsetting this again
    Object.assign(global.kequtest, originalKequtest);
});

it('creates a buffer', async function () {
    const result = new JobSuite(ABSOLUTE, FILES);

    assert.strictEqual(result.buffer.length, 2);
    assert.strictEqual(result.buffer[0].description, 'deep/other.fake-test.js');
    assert.strictEqual(result.buffer[1].description, 'index.fake-test.js');
});

it('sets filename and displays output', async function () {
    const result = new JobSuite(ABSOLUTE, FILES);
    const log = util.log();

    await result.run(log, parentHooks);

    assert.strictEqual(result.error, null);
    assert.strictEqual(global.kequtest.filename, FILES[FILES.length - 1]);
    assert.strictEqual(log.info.calls[0][0], 'Found 2 test files...');
});
