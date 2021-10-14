import assert from 'assert';
import path from 'path';

import CreateSuiteJob from '../../src/factory/suite-job';
import { administrative } from '../../src/main';

const ABSOLUTE = path.join(__dirname, '../fake-src');
const FILES = [
    path.join(ABSOLUTE, '/deep/other.fake-test.js'),
    path.join(ABSOLUTE, '/index.fake-test.js')
];

let originalKequtest;

beforeEach(function () {
    originalKequtest = Object.assign({}, administrative);
    Object.assign(administrative, { filename: null, container: null, depth: -1 });
});

afterEach(function () {
    // make sure we're unsetting this again
    Object.assign(administrative, originalKequtest);
});

it('sets filename and displays output', async function () {
    const result = CreateSuiteJob(FILES);
    const log = util.log();

    await result.run(log);

    assert.strictEqual(administrative.filename, FILES[FILES.length - 1]);
    assert.strictEqual(log.info.calls[0][0], 'Found 2 test files...');
    assert.strictEqual(log.error.calls.length, 0);
});
