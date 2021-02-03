const assert = require('assert');
const JobTest = require('../../src/jobs/job-test.js');

const DESCRIPTION = 'fake test description';

it('displays output', async function () {
    const result = new JobTest(DESCRIPTION, () => {}, 2);
    const log = util.log();
    await result.run(log);
    assert.strictEqual(result.error, null);
    assert.deepStrictEqual(log.info.calls, [
        ['  \u00B7 ' + DESCRIPTION + ' \x1b[32m\u2713\x1b[0m']
    ]);
});

it('displays output when cb fails', async function () {
    const error = new Error('fake test failure');
    const result = new JobTest(DESCRIPTION, () => { throw error; }, 2);
    const log = util.log();
    await result.run(log);
    assert.strictEqual(result.error, error);
    assert.deepStrictEqual(log.info.calls, [
        ['  \u00B7 ' + DESCRIPTION + ' \x1b[31m\u2717\x1b[0m'],
        [''],
        ['']
    ]);
    assert.deepStrictEqual(log.error.calls, [
        [error]
    ]);
});
