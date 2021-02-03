const assert = require('assert');
const Job = require('../../src/jobs/job.js');

const DESCRIPTION = 'fake description';

it('creates an instance', function () {
    const cb = () => {};
    const result = new Job(DESCRIPTION, cb, 0);
    assert.strictEqual(result.description, DESCRIPTION);
    assert.strictEqual(result.cb, cb);
    assert.strictEqual(result.depth, 0);
    assert.strictEqual(result.error, null);
});

it('runs the callback and displays output', async function () {
    const cb = util.spy();
    const result = new Job(DESCRIPTION, cb, 0);
    assert.strictEqual(cb.calls.length, 0);
    const log = util.log();
    await result.run(log);
    assert.strictEqual(result.error, null);
    assert.strictEqual(cb.calls.length, 1);
    assert.deepStrictEqual(log.info.calls, [
        [DESCRIPTION]
    ]);
});

it('displays output with depth', async function () {
    const result = new Job(DESCRIPTION, () => {}, 2);
    assert.strictEqual(result.depth, 2);
    const log = util.log();
    await result.run(log);
    assert.strictEqual(result.error, null);
    assert.deepStrictEqual(log.info.calls, [
        ['  \u00B7 ' + DESCRIPTION]
    ]);
});

it('displays an error when cb fails', async function () {
    const error = new Error('fake failure');
    const result = new Job(DESCRIPTION, () => { throw error; }, 2);
    const log = util.log();
    await result.run(log);
    assert.strictEqual(result.error, error);
    assert.deepStrictEqual(log.info.calls, [
        ['  \u00B7 ' + DESCRIPTION],
        [''],
        ['']
    ]);
    assert.deepStrictEqual(log.error.calls, [
        [error]
    ]);
});
