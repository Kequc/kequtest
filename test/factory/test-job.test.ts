import assert from 'assert';
import CreateTestJob from '../../src/factory/test-job';
import { CHARS, HookType } from '../../src/util/constants';

const DESCRIPTION = 'fake test description';

it('allows block to be undefined', function () {
    CreateTestJob(DESCRIPTION);
});

it('throws an error when description is invalid', function () {
    assert.throws(() => { CreateTestJob(undefined); }, { message: /^Description must be a string/ });
    assert.throws(() => { CreateTestJob(null); }, { message: /^Description must be a string/ });
    assert.throws(() => { CreateTestJob(100 as any); }, { message: /^Description must be a string/ });
});

it('throws an error when block is invalid', function () {
    assert.throws(() => { CreateTestJob('testing', null); }, { message: /^Block must be a function/ });
    assert.throws(() => { CreateTestJob('testing', 100 as any); }, { message: /^Block must be a function/ });
});

it('displays output', async function () {
    const logger = util.logger();
    const result = CreateTestJob(DESCRIPTION, () => {});

    await result.run(logger);

    assert.deepStrictEqual(logger.info.calls, [
        ['\u00B7 ' + DESCRIPTION + '\x1b[32m '+ CHARS.success + '\x1b[0m']
    ]);
});

it('displays output when block fails', async function () {
    const error = new Error('fake test failure');
    const logger = util.logger();
    const result = CreateTestJob(DESCRIPTION, () => { throw error; });

    await result.run(logger);

    assert.deepStrictEqual(logger.info.calls, [
        ['\u00B7 ' + DESCRIPTION + '\x1b[31m ' + CHARS.fail + '\x1b[0m'],
        [''],
        ['']
    ]);
    assert.deepStrictEqual(logger.error.calls, [
        [error]
    ]);
});

it('displays output when block is undefined', async function () {
    const logger = util.logger();
    const result = CreateTestJob(DESCRIPTION, undefined);

    await result.run(logger);

    assert.strictEqual(logger.error.calls.length, 0);
    assert.deepStrictEqual(logger.info.calls, [
        ['\u00B7 ' + DESCRIPTION + '\x1b[32m -- missing --\x1b[0m']
    ]);
});

it('runs beforeEach hooks', async function () {
    const parentHooks = {
        [HookType.BEFORE_EACH]: [util.spy(), util.spy()],
        [HookType.AFTER_EACH]: []
    };
    const result = CreateTestJob(DESCRIPTION, () => {});

    await result.run(util.logger(), parentHooks);

    assert.strictEqual(parentHooks[HookType.BEFORE_EACH][0].calls.length, 1);
    assert.strictEqual(parentHooks[HookType.BEFORE_EACH][1].calls.length, 1);
});

it('runs afterEach hooks', async function () {
    const parentHooks = {
        [HookType.BEFORE_EACH]: [],
        [HookType.AFTER_EACH]: [util.spy(), util.spy()]
    };
    const result = CreateTestJob(DESCRIPTION, () => {});

    await result.run(util.logger(), parentHooks);

    assert.strictEqual(parentHooks[HookType.AFTER_EACH][0].calls.length, 1);
    assert.strictEqual(parentHooks[HookType.AFTER_EACH][1].calls.length, 1);
});

describe('score', function () {
    it('reports passed test', async function () {
        const result = CreateTestJob(DESCRIPTION, () => {});

        await result.run(util.logger());

        assert.deepStrictEqual(result.getScore(), {
            passed: [result],
            failed: [],
            missing: [],
            catastrophic: []
        });
    });

    it('reports failed test', async function () {
        const result = CreateTestJob(DESCRIPTION, () => { throw new Error('error1'); });

        await result.run(util.logger());

        assert.deepStrictEqual(result.getScore(), {
            passed: [],
            failed: [result],
            missing: [],
            catastrophic: []
        });
    });

    it('reports missing test', function () {
        const result = CreateTestJob(DESCRIPTION);

        assert.deepStrictEqual(result.getScore(), {
            passed: [],
            failed: [],
            missing: [result],
            catastrophic: []
        });
    });
});
