const assert = require('assert');
const JobTest = require('../../src/jobs/job-test.js');

const DESCRIPTION = 'fake test description';

let parentHooks;

beforeEach(function () {
    parentHooks = { beforeEach: [], afterEach: [] };
});

it('displays output', async function () {
    const log = util.log();
    const result = new JobTest(DESCRIPTION, () => {}, 2);

    await result.run(log, parentHooks);

    assert.strictEqual(result.error, null);
    assert.deepStrictEqual(log.info.calls, [
        ['  \u00B7 ' + DESCRIPTION + '\x1b[32m \u2713\x1b[0m']
    ]);
});

it('displays output when block fails', async function () {
    const error = new Error('fake test failure');
    const log = util.log();
    const result = new JobTest(DESCRIPTION, () => { throw error; }, 2);

    await result.run(log, parentHooks);

    assert.strictEqual(result.error, error);
    assert.deepStrictEqual(log.info.calls, [
        ['  \u00B7 ' + DESCRIPTION + '\x1b[31m \u2717\x1b[0m'],
        [''],
        ['']
    ]);
    assert.deepStrictEqual(log.error.calls, [
        [error]
    ]);
});

it('displays output when block is undefined', async function () {
    const log = util.log();
    const result = new JobTest(DESCRIPTION, undefined, 2);

    await result.run(log, parentHooks);

    assert.strictEqual(result.error, null);
    assert.deepStrictEqual(log.info.calls, [
        ['  \u00B7 ' + DESCRIPTION + '\x1b[32m -- missing --\x1b[0m']
    ]);
});

it('runs beforeEach hooks', async function () {
    parentHooks.beforeEach = [util.spy(), util.spy()];
    const result = new JobTest(DESCRIPTION, () => {}, 0);

    await result.run(util.log(), parentHooks);

    assert.strictEqual(parentHooks.beforeEach[0].calls.length, 1);
    assert.strictEqual(parentHooks.beforeEach[1].calls.length, 1);
});

it('runs afterEach hooks', async function () {
    parentHooks.afterEach = [util.spy(), util.spy()];
    const result = new JobTest(DESCRIPTION, () => {}, 0);

    await result.run(util.log(), parentHooks);

    assert.strictEqual(parentHooks.afterEach[0].calls.length, 1);
    assert.strictEqual(parentHooks.afterEach[1].calls.length, 1);
});

describe('getData', function () {
    it('reports passed test', function () {
        const result = new JobTest(DESCRIPTION, () => {}, 0);

        assert.deepStrictEqual(result.getData(), {
            passed: 1,
            failed: 0,
            missing: 0,
            catastrophic: 0
        });
    });

    it('reports failed test', function () {
        const result = new JobTest(DESCRIPTION, () => {}, 0);
        result.error = new Error('error1');

        assert.deepStrictEqual(result.getData(), {
            passed: 0,
            failed: 1,
            missing: 0,
            catastrophic: 0
        });
    });

    it('reports missing test', function () {
        const result = new JobTest(DESCRIPTION, undefined, 0);

        assert.deepStrictEqual(result.getData(), {
            passed: 0,
            failed: 0,
            missing: 1,
            catastrophic: 0
        });
    });
});
