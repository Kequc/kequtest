const assert = require('assert');
const JobSuite = require('../../src/jobs/job-suite.js');

const ABSOLUTE = __dirname + '/fake-src';
const FILES = [
    ABSOLUTE + '/deep/other.fake-test.js',
    ABSOLUTE + '/index.fake-test.js'
];

let parentHooks;
let originalKequtestContainer;

beforeEach(function () {
    parentHooks = { beforeEach: [], afterEach: [] };
    originalKequtestContainer = global.kequtest.container;
    global.kequtest.container = null;
});

afterEach(function () {
    // Make sure we're unsetting this again
    global.kequtest.container = originalKequtestContainer;
});

it('creates a buffer', async function () {
    const result = new JobSuite(ABSOLUTE, FILES);

    assert.strictEqual(result.buffer.length, 2);
    assert.strictEqual(result.buffer[0].description, 'deep/other.fake-test.js');
    assert.strictEqual(result.buffer[1].description, 'index.fake-test.js');
});

it('displays output', async function () {
    const result = new JobSuite(ABSOLUTE, FILES);
    const log = util.log();

    await result.run(log, parentHooks);

    assert.strictEqual(result.error, null);
    assert.strictEqual(log.info.calls[0][0], 'Found 2 test files...');
});
