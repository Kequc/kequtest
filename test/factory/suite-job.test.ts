import assert from 'assert';
import path from 'path';

import CreateSuiteJob from '../../src/factory/suite-job';
import { summary } from '../../src/main';

const ABSOLUTE = path.join(__dirname, '../fake-src');
const FILES = [
    path.join(ABSOLUTE, '/deep/other.fake-test.js'),
    path.join(ABSOLUTE, '/index.fake-test.js')
];

it('sets filename and displays output', async function () {
    const result = CreateSuiteJob(FILES);
    const logger = util.logger();

    await result.run(logger);

    assert.strictEqual(summary.filename, FILES[FILES.length - 1]);
    assert.strictEqual(logger.info.calls[0][0], 'Found 2 test files...');
    assert.strictEqual(logger.error.calls.length, 0);
});
