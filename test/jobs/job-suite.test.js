const assert = require('assert');
const path = require('path');
const JobSuite = require('../../src/jobs/job-suite.js');

const ABSOLUTE = path.join(__dirname, '/fake-src');
const FILES = [
    path.join(ABSOLUTE, '/deep/other.fake-test.js'),
    path.join(ABSOLUTE, '/index.fake-test.js')
];

let clientHooks;
let originalKequtest;

beforeEach(function () {
    clientHooks = { beforeEach: [], afterEach: [] };
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
    assert.strictEqual(result.buffer[0].description, path.normalize('deep/other.fake-test.js'));
    assert.strictEqual(result.buffer[1].description, 'index.fake-test.js');
});

it('sets filename and displays output', async function () {
    const result = new JobSuite(ABSOLUTE, FILES);
    const log = util.log();

    await result.run(log, clientHooks);

    assert.strictEqual(result.error, null);
    assert.strictEqual(global.kequtest.filename, FILES[FILES.length - 1]);
    assert.strictEqual(log.info.calls[0][0], 'Found 2 test files...');
});
