import assert from 'assert';
import CreateContainerJob from '../../src/factory/container-job';
import { HookType } from '../../src/helpers';
import { administrative } from '../../src/main';

const DESCRIPTION = 'fake description';

it('allows block to be undefined', function () {
    CreateContainerJob(DESCRIPTION);
});

it('throws an error when description is invalid', function () {
    assert.throws(() => { CreateContainerJob(undefined); }, { message: /^Description must be a string/ });
    assert.throws(() => { CreateContainerJob(null); }, { message: /^Description must be a string/ });
    assert.throws(() => { CreateContainerJob(100 as any); }, { message: /^Description must be a string/ });
});

it('throws an error when block is invalid', function () {
    assert.throws(() => { CreateContainerJob('testing', null); }, { message: /^Block must be a function/ });
    assert.throws(() => { CreateContainerJob('testing', 100 as any); }, { message: /^Block must be a function/ });
});

it('displays an error when block fails', async function () {
    const error = new Error('fake failure');
    const log = util.log();
    const result = CreateContainerJob(DESCRIPTION, () => { throw error; });

    await result.run(log);

    assert.deepStrictEqual(log.info.calls, [
        [DESCRIPTION],
        [''],
        ['']
    ]);
    assert.deepStrictEqual(log.error.calls, [
        [error]
    ]);
});

it('runs the block sets container and displays output', async function () {
    const block = util.spy();
    const log = util.log();

    const result = CreateContainerJob(DESCRIPTION, block);

    assert.strictEqual(block.calls.length, 0);
    await result.run(log);
    assert.strictEqual(block.calls.length, 1);

    assert.strictEqual(administrative.container, result);
    assert.deepStrictEqual(log.info.calls, [
        [DESCRIPTION]
    ]);
    assert.strictEqual(log.error.calls.length, 0);
});

it('runs before hooks', async function () {
    const result = CreateContainerJob(DESCRIPTION, () => {});
    const before = [util.spy(), util.spy()];

    result.addHook(HookType.BEFORE, before[0]);
    result.addHook(HookType.BEFORE, before[1]);

    await result.run(util.log());

    assert.strictEqual(before[0].calls.length, 1);
    assert.strictEqual(before[1].calls.length, 1);
});

it('runs after hooks', async function () {
    const result = CreateContainerJob(DESCRIPTION, () => {});
    const after = [util.spy(), util.spy()];

    result.addHook(HookType.AFTER, after[0]);
    result.addHook(HookType.AFTER, after[1]);

    await result.run(util.log());

    assert.strictEqual(after[0].calls.length, 1);
    assert.strictEqual(after[1].calls.length, 1);
});

it('runs buffer', async function () {
    const result = CreateContainerJob(DESCRIPTION, () => {});
    const before = [util.spy()];
    const buffer = [util.spy(), util.spy()];
    const after = [util.spy()];

    result.addHook(HookType.BEFORE, before[0]);
    result.addTest('test1', buffer[0]);
    result.addTest('test2', buffer[1]);
    result.addHook(HookType.AFTER, after[0]);

    await result.run(util.log());

    assert.strictEqual(before[0].calls.length, 1);
    assert.strictEqual(buffer[0].calls.length, 1);
    assert.strictEqual(buffer[1].calls.length, 1);
    assert.strictEqual(after[0].calls.length, 1);
});

describe('using mocks', function () {
    let originalMockStop;

    beforeEach(function () {
        originalMockStop =  global.util.mock.stop;
        global.util.mock.stop = util.spy();
    });

    afterEach(function () {
        global.util.mock.stop = originalMockStop;
    });

    it('stops mocks', async function () {
        const result = CreateContainerJob(DESCRIPTION, () => {});
        const buffer = [util.spy(), util.spy()];

        result.addMock('mock1');
        result.addMock('mock2');
        result.addTest('test1', buffer[0]);
        result.addTest('test2', buffer[1]);
    
        await result.run(util.log());
    
        assert.deepStrictEqual((global.util.mock.stop as any).calls, [['mock1'], ['mock2']]);
    });
    
    it('bails early if catastrophic error is encountered', async function () {
        const log = util.log();

        const result = CreateContainerJob(DESCRIPTION, () => { throw new Error('error1'); });
        result.addMock('mock1');
        result.addMock('mock2');
    
        await result.run(log);
    
        assert.deepStrictEqual((global.util.mock.stop as any).calls, [['mock1'], ['mock2']]);
    });
});

it('sends hooks along to children', async function () {
    const hookCalls = [];
    const add = (num: number) => () => {
        hookCalls.push(num);
    };

    const result = CreateContainerJob(DESCRIPTION, () => {});
    const beforeEach = [util.spy(add(0)), util.spy(add(1))];
    const afterEach = [util.spy(add(2)), util.spy(add(3))];
    const test = util.spy();

    const parentHooks = {
        [HookType.BEFORE_EACH]: [util.spy(add(4)), util.spy(add(5))],
        [HookType.AFTER_EACH]: [util.spy(add(6)), util.spy(add(7))]
    };

    result.addHook(HookType.BEFORE_EACH, beforeEach[0]);
    result.addHook(HookType.BEFORE_EACH, beforeEach[1]);
    result.addHook(HookType.AFTER_EACH, afterEach[0]);
    result.addHook(HookType.AFTER_EACH, afterEach[1]);
    result.addTest('test1', test);

    await result.run(util.log(), parentHooks);

    assert.strictEqual(parentHooks[HookType.BEFORE_EACH][0].calls.length, 1);
    assert.strictEqual(parentHooks[HookType.AFTER_EACH][0].calls.length, 1);
    assert.strictEqual(test.calls.length, 1);
    assert.deepStrictEqual(hookCalls, [4, 5, 0, 1, 2, 3, 6, 7]);
});

describe('score', function () {
    it('produces test results', function () {
        const result = CreateContainerJob(DESCRIPTION);

        const containers = [
            result.addContainer(DESCRIPTION),
            result.addContainer(DESCRIPTION)
        ];

        const jobs = [
            containers[0].addTest('test1'),
            containers[0].addTest('test2'),
            containers[1].addTest('test3'),
            containers[1].addTest('test4'),
            result.addTest('test5'),
            result.addTest('test6')
        ];

        jobs[0].getScore = () => ({ passed: 1, failed: 0, missing: 0, catastrophic: 0 });
        jobs[1].getScore = () => ({ passed: 0, failed: 0, missing: 1, catastrophic: 0 });
        jobs[2].getScore = () => ({ passed: 0, failed: 1, missing: 0, catastrophic: 0 });
        jobs[3].getScore = () => ({ passed: 0, failed: 0, missing: 0, catastrophic: 1 });
        jobs[4].getScore = () => ({ passed: 1, failed: 0, missing: 0, catastrophic: 0 });
        jobs[5].getScore = () => ({ passed: 0, failed: 1, missing: 0, catastrophic: 0 });

        assert.deepStrictEqual(result.getScore(), {
            passed: 2,
            failed: 2,
            missing: 1,
            catastrophic: 1
        });
    });

    it('reports catastrophic error', async function () {
        const result = CreateContainerJob(DESCRIPTION, () => { throw new Error('error1'); });

        await result.run(util.log());

        assert.deepStrictEqual(result.getScore(), {
            passed: 0,
            failed: 0,
            missing: 0,
            catastrophic: 1
        });
    });
});
