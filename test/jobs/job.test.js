const assert = require('assert');
const Job = require('../../src/jobs/job.js');

const DESCRIPTION = 'fake description';

it('creates an instance', function () {
    const block = () => {};
    const result = new Job(DESCRIPTION, block, 0);

    assert.strictEqual(result.description, DESCRIPTION);
    assert.strictEqual(result.block, block);
    assert.strictEqual(result.depth, 0);
    assert.strictEqual(result.error, null);
});

it('throws an error when description is invalid', function () {
    const block = () => {};
    assert.throws(() => { new Job(undefined, block, 0); }, { message: /^Description must be a string/ });
    assert.throws(() => { new Job(null, block, 0); }, { message: /^Description must be a string/ });
    assert.throws(() => { new Job(100, block, 0); }, { message: /^Description must be a string/ });
});

it('throws an error when block is invalid', function () {
    assert.throws(() => { new Job('testing', null, 0); }, { message: /^Block must be a function/ });
    assert.throws(() => { new Job('testing', 100, 0); }, { message: /^Block must be a function/ });
});

it('allows block to be undefined', function () {
    const block = undefined;
    const result = new Job(DESCRIPTION, block, 0);
    assert.strictEqual(result.block, undefined);
});

it('runs the block and displays output', async function () {
    const log = util.log();
    const block = util.spy();
    const result = new Job(DESCRIPTION, block, 0);

    assert.strictEqual(block.calls.length, 0);
    await result.clientCode(log);
    assert.strictEqual(block.calls.length, 1);

    assert.strictEqual(result.error, null);
    assert.deepStrictEqual(log.info.calls, [
        [DESCRIPTION]
    ]);
});

it('displays output with depth', async function () {
    const log = util.log();
    const result = new Job(DESCRIPTION, () => {}, 2);

    await result.clientCode(log);

    assert.strictEqual(result.depth, 2);
    assert.deepStrictEqual(log.info.calls, [
        ['    ' + DESCRIPTION]
    ]);
});

it('displays an error when block fails', async function () {
    const error = new Error('fake failure');
    const log = util.log();
    const result = new Job(DESCRIPTION, () => { throw error; }, 2);

    await result.clientCode(log);

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

it('reports empty test results', function () {
    const result = new Job(DESCRIPTION, () => {}, 0);

    assert.deepStrictEqual(result.getScore(), {
        passed: 0,
        failed: 0,
        missing: 0,
        catastrophic: 0
    });
});
