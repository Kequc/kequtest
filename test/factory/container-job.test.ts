import assert from 'assert';
import CreateContainerJob from '../../src/factory/container-job';
import { HookType } from '../../src/util/constants';
import CreateSummary from '../../src/env/summary';

it('allows block to be undefined', function () {
    CreateContainerJob('container1');
});

it('throws an error when description is invalid', function () {
    assert.throws(() => { CreateContainerJob(undefined); }, { message: /^Description must be a string/ });
    assert.throws(() => { CreateContainerJob(null); }, { message: /^Description must be a string/ });
    assert.throws(() => { CreateContainerJob(100 as any); }, { message: /^Description must be a string/ });
});

it('throws an error when block is invalid', function () {
    assert.throws(() => { CreateContainerJob('container1', null); }, { message: /^Block must be a function/ });
    assert.throws(() => { CreateContainerJob('container1', 100 as any); }, { message: /^Block must be a function/ });
});

it('logs an error when block fails', async function () {
    const error = new Error('error1');
    const logger = util.logger();
    const summary = CreateSummary();
    const result = CreateContainerJob('container1', () => { throw error; });

    await result.run(summary, logger);

    assert.deepStrictEqual(logger.info.calls, [
        ['container1']
    ]);
    assert.deepStrictEqual(summary.failures, [
        { error, logs: [], tree: [result] }
    ]);
});

it('runs the block sets container and displays output', async function () {
    const block = util.spy();
    const logger = util.logger();

    const summary = CreateSummary();
    const result = CreateContainerJob('container1', block);

    assert.strictEqual(block.calls.length, 0);
    await result.run(summary, logger);
    assert.strictEqual(block.calls.length, 1);

    assert.strictEqual(summary.container, result);
    assert.deepStrictEqual(logger.info.calls, [
        ['container1']
    ]);
});

it('runs before hooks', async function () {
    const summary = CreateSummary();
    const result = CreateContainerJob('container1');
    const before = [util.spy(), util.spy()];

    result.addHook(HookType.BEFORE, before[0]);
    result.addHook(HookType.BEFORE, before[1]);

    await result.run(summary, util.logger());

    assert.strictEqual(before[0].calls.length, 1);
    assert.strictEqual(before[1].calls.length, 1);
});

it('runs after hooks', async function () {
    const summary = CreateSummary();
    const result = CreateContainerJob('container1');
    const after = [util.spy(), util.spy()];

    result.addHook(HookType.AFTER, after[0]);
    result.addHook(HookType.AFTER, after[1]);

    await result.run(summary, util.logger());

    assert.strictEqual(after[0].calls.length, 1);
    assert.strictEqual(after[1].calls.length, 1);
});

it('runs buffer', async function () {
    const summary = CreateSummary();
    const result = CreateContainerJob('container1');
    const before = [util.spy()];
    const buffer = [util.spy(), util.spy()];
    const after = [util.spy()];

    result.addHook(HookType.BEFORE, before[0]);
    result.addTest('test1', buffer[0]);
    result.addTest('test2', buffer[1]);
    result.addHook(HookType.AFTER, after[0]);

    await result.run(summary, util.logger());

    assert.strictEqual(before[0].calls.length, 1);
    assert.strictEqual(buffer[0].calls.length, 1);
    assert.strictEqual(buffer[1].calls.length, 1);
    assert.strictEqual(after[0].calls.length, 1);
});

describe('using mocks', function () {
    let originalMockStop: (mock: string) => void;

    beforeEach(function () {
        originalMockStop = global.util.mock.stop;
        global.util.mock.stop = util.spy();
    });

    afterEach(function () {
        global.util.mock.stop = originalMockStop;
    });

    it('stops mocks', async function () {
        const summary = CreateSummary();
        const result = CreateContainerJob('container1');
        const buffer = [util.spy(), util.spy()];

        result.addMock('mock1');
        result.addMock('mock2');
        result.addTest('test1', buffer[0]);
        result.addTest('test2', buffer[1]);

        await result.run(summary, util.logger());

        assert.deepStrictEqual((global.util.mock.stop as any).calls, [['mock1'], ['mock2']]);
    });

    it('stops mocks even if there is a container error', async function () {
        const logger = util.logger();

        const summary = CreateSummary();
        const result = CreateContainerJob('container1', () => { throw new Error('error1'); });
        result.addMock('mock1');
        result.addMock('mock2');

        await result.run(summary, logger);

        assert.deepStrictEqual((global.util.mock.stop as any).calls, [['mock1'], ['mock2']]);
    });
});

it('sends hooks along to children', async function () {
    const hookCalls = [];
    const add = (num: number) => () => {
        hookCalls.push(num);
    };

    const summary = CreateSummary();
    const result = CreateContainerJob('container1');
    const container = result.addContainer('container2');
    const hooks = [
        util.spy(add(0)),
        util.spy(add(1)),
        util.spy(add(2)),
        util.spy(add(3)),
        util.spy(add(4)),
        util.spy(add(5))
    ];
    const test = util.spy();

    result.addHook(HookType.BEFORE_EACH, hooks[0]);
    result.addHook(HookType.BEFORE_EACH, hooks[1]);
    result.addHook(HookType.AFTER_EACH, hooks[2]);
    result.addHook(HookType.AFTER_EACH, hooks[3]);
    container.addHook(HookType.BEFORE_EACH, hooks[4]);
    container.addHook(HookType.AFTER_EACH, hooks[5]);
    container.addTest('test1', test);

    await result.run(summary, util.logger());

    assert.strictEqual(hooks[0].calls.length, 1);
    assert.strictEqual(hooks[1].calls.length, 1);
    assert.strictEqual(hooks[0].calls.length, 1);
    assert.strictEqual(hooks[1].calls.length, 1);
    assert.strictEqual(test.calls.length, 1);
    assert.deepStrictEqual(hookCalls, [0, 1, 4, 5, 2, 3]);
});
