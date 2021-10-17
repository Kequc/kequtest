import assert from 'assert';
import path from 'path';
import CreateSummary from '../../src/env/summary';
import CreateSuite from '../../src/factory/suite';

const ABSOLUTE = path.join(__dirname, '../fake-src');
const FILES = [
    path.join(ABSOLUTE, '/deep/other.fake-test.js'),
    path.join(ABSOLUTE, '/index.fake-test.js')
];

it('sets filename and displays output', async function () {
    const logger = util.logger();
    const summary = CreateSummary();
    const result = CreateSuite(summary, logger, FILES);

    await result.run();

    assert.strictEqual(summary.filename, FILES[FILES.length - 1]);
    assert.deepStrictEqual(logger.info.calls, [
        [''],
        ['/test/fake-src/deep/other.fake-test.js'],
        [''],
        ['/test/fake-src/index.fake-test.js'],
    ]);
    assert.strictEqual(logger.error.calls.length, 0);
});
