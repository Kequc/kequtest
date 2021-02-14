const assert = require('assert');
const JobContainer = require('../../src/jobs/job-container.js');

const DESCRIPTION = 'fake description';

let parentHooks;
let originalKequtest;

beforeEach(function () {
    parentHooks = { beforeEach: [], afterEach: [] };
    originalKequtest = Object.assign({}, global.kequtest);
    global.kequtest = { filename: null, container: null };
});

afterEach(function () {
    // Make sure we're unsetting this again
    Object.assign(global.kequtest, originalKequtest);
});

it('creates an instance', function () {
    const block = () => {};

    const result = new JobContainer(DESCRIPTION, block, 0);

    assert.strictEqual(result.description, DESCRIPTION);
    assert.strictEqual(result.block, block);
    assert.strictEqual(result.depth, 0);
    assert.strictEqual(result.error, null);
    assert.deepStrictEqual(result.buffer, []);
    assert.deepStrictEqual(result.hooks, {
        before: [],
        beforeEach: [],
        afterEach: [],
        after: []
    });
    assert.deepStrictEqual(result.mocks, []);
});

it('runs the block sets container and displays output', async function () {
    const block = util.spy();
    const log = util.log();

    const result = new JobContainer(DESCRIPTION, block, 2);

    assert.strictEqual(block.calls.length, 0);
    await result.run(log, parentHooks);
    assert.strictEqual(block.calls.length, 1);

    assert.strictEqual(result.error, null);
    assert.strictEqual(global.kequtest.container, result);
    assert.deepStrictEqual(log.info.calls, [
        ['    ' + DESCRIPTION]
    ]);
});

it('runs before hooks', async function () {
    const result = new JobContainer(DESCRIPTION, () => {}, 0);
    result.hooks.before = [util.spy(), util.spy()];

    await result.run(util.log(), parentHooks);

    assert.strictEqual(result.hooks.before[0].calls.length, 1);
    assert.strictEqual(result.hooks.before[1].calls.length, 1);
});

it('runs after hooks', async function () {
    const result = new JobContainer(DESCRIPTION, () => {}, 0);
    result.hooks.after = [util.spy(), util.spy()];

    await result.run(util.log(), parentHooks);

    assert.strictEqual(result.hooks.after[0].calls.length, 1);
    assert.strictEqual(result.hooks.after[1].calls.length, 1);
});

it('runs buffer', async function () {
    const result = new JobContainer(DESCRIPTION, () => {}, 0);
    result.hooks.before = [util.spy()];
    result.buffer = [{ run: util.spy() }, { run: util.spy() }];
    result.hooks.after = [util.spy()];

    await result.run(util.log(), parentHooks);

    assert.strictEqual(result.hooks.before[0].calls.length, 1);
    assert.strictEqual(result.buffer[0].run.calls.length, 1);
    assert.strictEqual(result.buffer[1].run.calls.length, 1);
    assert.strictEqual(result.hooks.after[0].calls.length, 1);
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
        const result = new JobContainer(DESCRIPTION, () => {}, 0);
        result.mocks = ['test1', 'test2'];
        result.buffer = [{ run: util.spy() }, { run: util.spy() }];
    
        await result.run(util.log(), parentHooks);
    
        assert.strictEqual(result.error, null);
        assert.strictEqual(result.buffer.length, 2);
        assert.deepStrictEqual(global.util.mock.stop.calls, [['test1'], ['test2']]);
    });
    
    it('bails early if catastrophic error is encountered', async function () {
        const log = util.log();
        const error = new Error('container error');

        const result = new JobContainer(DESCRIPTION, () => { throw error; }, 2);
        result.mocks = ['test1', 'test2'];
    
        await result.run(log, parentHooks);
    
        assert.strictEqual(result.error, error);
        assert.strictEqual(result.buffer.length, 0);
        assert.deepStrictEqual(global.util.mock.stop.calls, [['test1'], ['test2']]);
    });
});

it('sends hooks along to children', async function () {
    const result = new JobContainer(DESCRIPTION, () => {}, 0);
    parentHooks = { beforeEach: [util.spy(), util.spy()], afterEach: [util.spy(), util.spy()] };
    result.hooks.beforeEach = [util.spy(), util.spy()];
    result.hooks.afterEach = [util.spy(), util.spy()];
    result.buffer = [
        { run: util.spy() }
    ];

    await result.run(util.log(), parentHooks);

    assert.strictEqual(parentHooks.beforeEach[0].calls.length, 0);
    assert.strictEqual(parentHooks.afterEach[0].calls.length, 0);
    assert.strictEqual(result.buffer[0].run.calls.length, 1);
    assert.deepStrictEqual(result.buffer[0].run.calls[0][1], {
        beforeEach: [
            parentHooks.beforeEach[0],
            parentHooks.beforeEach[1],
            result.hooks.beforeEach[0],
            result.hooks.beforeEach[1]
        ],
        afterEach: [
            result.hooks.afterEach[0],
            result.hooks.afterEach[1],
            parentHooks.afterEach[0],
            parentHooks.afterEach[1]
        ]
    });
});

describe('score', function () {
    it('produces test results', function () {
        const result = new JobContainer(DESCRIPTION, () => {}, 1);
        result.buffer = [
            new JobContainer(DESCRIPTION, () => {}, 1),
            new JobContainer(DESCRIPTION, () => {}, 1),
            { getScore: () => ({ passed: 1, failed: 0, missing: 0, catastrophic: 0 }) },
            { getScore: () => ({ passed: 0, failed: 1, missing: 0, catastrophic: 0 }) },
        ];
        result.buffer[0].buffer = [
            { getScore: () => ({ passed: 1, failed: 0, missing: 0, catastrophic: 0 }) },
            { getScore: () => ({ passed: 0, failed: 0, missing: 1, catastrophic: 0 }) },
        ];
        result.buffer[1].buffer = [
            { getScore: () => ({ passed: 0, failed: 1, missing: 0, catastrophic: 0 }) },
            { getScore: () => ({ passed: 0, failed: 0, missing: 0, catastrophic: 1 }) },
        ];

        assert.deepStrictEqual(result.getScore(), {
            passed: 2,
            failed: 2,
            missing: 1,
            catastrophic: 1
        });
    });

    it('reports catastrophic error', function () {
        const result = new JobContainer(DESCRIPTION, () => {}, 1);
        result.error = new Error('error1');

        assert.deepStrictEqual(result.getScore(), {
            passed: 0,
            failed: 0,
            missing: 0,
            catastrophic: 1
        });
    });
});
