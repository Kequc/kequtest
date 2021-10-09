import assert from 'assert';
import path from 'path';
import JobSuite from '../../src/jobs/job-suite';
import { administrative } from '../../src/main';

const ABSOLUTE = path.join(__dirname, '/fake-src');
const FILES = [
    path.join(ABSOLUTE, '/deep/other.fake-test.js'),
    path.join(ABSOLUTE, '/index.fake-test.js')
];

let originalKequtest;

beforeEach(function () {
    originalKequtest = Object.assign({}, administrative);
    Object.assign(administrative, { filename: null, container: null });
});

afterEach(function () {
    // make sure we're unsetting this again
    Object.assign(administrative, originalKequtest);
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

    await result.run(log);

    assert.strictEqual(result.error, null);
    assert.strictEqual(administrative.filename, FILES[FILES.length - 1]);
    assert.strictEqual(log.info.calls[0][0], 'Found 2 test files...');
});
