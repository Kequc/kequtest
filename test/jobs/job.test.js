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

it('throws an error when description is invalid', function () {
    const cb = () => {};
    assert.throws(() => { new Job(undefined, cb, 0); }, { message: /^Description must be a string/ });
    assert.throws(() => { new Job(null, cb, 0); }, { message: /^Description must be a string/ });
    assert.throws(() => { new Job(100, cb, 0); }, { message: /^Description must be a string/ });
});

it('throws an error when callback is invalid', function () {
    assert.throws(() => { new Job('testing', null, 0); }, { message: /^Block must be a function/ });
    assert.throws(() => { new Job('testing', 100, 0); }, { message: /^Block must be a function/ });
});

it('allows block to be undefined', function () {
    const cb = undefined;
    const result = new Job(DESCRIPTION, cb, 0);
    assert.strictEqual(result.cb, undefined);
});

it('runs the callback and displays output', async function () {
    const log = util.log();
    const cb = util.spy();
    const result = new Job(DESCRIPTION, cb, 0);

    assert.strictEqual(cb.calls.length, 0);
    await result.run(log);
    assert.strictEqual(cb.calls.length, 1);

    assert.strictEqual(result.error, null);
    assert.deepStrictEqual(log.info.calls, [
        [DESCRIPTION]
    ]);
});

it('displays output with depth', async function () {
    const log = util.log();
    const result = new Job(DESCRIPTION, () => {}, 2);

    await result.run(log);

    assert.strictEqual(result.depth, 2);
    assert.deepStrictEqual(log.info.calls, [
        ['    ' + DESCRIPTION]
    ]);
});

it('displays an error when cb fails', async function () {
    const error = new Error('fake failure');
    const log = util.log();
    const result = new Job(DESCRIPTION, () => { throw error; }, 2);

    await result.run(log);

    assert.strictEqual(result.error, error);
    assert.deepStrictEqual(log.info.calls, [
        ['    ' + DESCRIPTION],
        [''],
        ['']
    ]);
    assert.deepStrictEqual(log.error.calls, [
        [error]
    ]);
});
