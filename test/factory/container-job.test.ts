import assert from 'assert';
import CreateContainerJob from '../../src/factory/container-job';
import CreateTestJob from '../../src/factory/test-job';
import { HookType } from '../../src/helpers';
import { administrative } from '../../src/main';

const DESCRIPTION = 'fake description';

let originalKequtest;

beforeEach(function () {
    originalKequtest = Object.assign({}, administrative);
    Object.assign(administrative, { filename: null, container: null, depth: -1 });
});

afterEach(function () {
    // make sure we're unsetting this again
    Object.assign(administrative, originalKequtest);
});

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
    result.addJob(CreateTestJob('test1', buffer[0]));
    result.addJob(CreateTestJob('test2', buffer[1]));
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
        result.addJob(CreateTestJob('test1', buffer[0]));
        result.addJob(CreateTestJob('test2', buffer[1]));
    
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
    const result = CreateContainerJob(DESCRIPTION, () => {});
    const beforeEach = [util.spy(), util.spy()];
    const afterEach = [util.spy(), util.spy()];
    const buffer = [util.spy()];

    const parentHooks = {
        [HookType.BEFORE_EACH]: [util.spy(), util.spy()],
        [HookType.AFTER_EACH]: [util.spy(), util.spy()]
    };

    result.addHook(HookType.BEFORE_EACH, beforeEach[0]);
    result.addHook(HookType.BEFORE_EACH, beforeEach[1]);
    result.addHook(HookType.AFTER_EACH, afterEach[0]);
    result.addHook(HookType.AFTER_EACH, afterEach[1]);
    result.addJob(CreateTestJob('test1', buffer[0]));

    await result.run(util.log(), parentHooks);

    console.log(buffer[0].calls);

    assert.strictEqual(parentHooks[HookType.BEFORE_EACH][0].calls.length, 1);
    assert.strictEqual(parentHooks[HookType.AFTER_EACH][0].calls.length, 1);
    assert.strictEqual(buffer[0].calls.length, 1);
    assert.deepStrictEqual(buffer[0].calls[0][1], {
        [HookType.BEFORE_EACH]: [
            parentHooks[HookType.BEFORE_EACH][0],
            parentHooks[HookType.BEFORE_EACH][1],
            beforeEach[0],
            beforeEach[1]
        ],
        [HookType.AFTER_EACH]: [
            afterEach[0],
            afterEach[1],
            parentHooks[HookType.AFTER_EACH][0],
            parentHooks[HookType.AFTER_EACH][1]
        ]
    });
});

describe('score', function () {
    it('produces test results', function () {
        const result = CreateContainerJob(DESCRIPTION, () => {});

        const containers = [
            CreateContainerJob(DESCRIPTION, () => {}),
            CreateContainerJob(DESCRIPTION, () => {})
        ];
        const jobs = [
            CreateTestJob('test1'),
            CreateTestJob('test2'),
            CreateTestJob('test3'),
            CreateTestJob('test4'),
            CreateTestJob('test5'),
            CreateTestJob('test6')
        ];

        jobs[0].getScore = () => ({ passed: 1, failed: 0, missing: 0, catastrophic: 0 });
        jobs[1].getScore = () => ({ passed: 0, failed: 0, missing: 1, catastrophic: 0 });
        jobs[2].getScore = () => ({ passed: 0, failed: 1, missing: 0, catastrophic: 0 });
        jobs[3].getScore = () => ({ passed: 0, failed: 0, missing: 0, catastrophic: 1 });
        jobs[4].getScore = () => ({ passed: 1, failed: 0, missing: 0, catastrophic: 0 });
        jobs[5].getScore = () => ({ passed: 0, failed: 1, missing: 0, catastrophic: 0 });

        containers[0].addJob(jobs[0]);
        containers[0].addJob(jobs[1]);
        containers[1].addJob(jobs[2]);
        containers[1].addJob(jobs[3]);

        result.addJob(containers[0]);
        result.addJob(containers[1]);
        result.addJob(jobs[4]);
        result.addJob(jobs[5]);

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
