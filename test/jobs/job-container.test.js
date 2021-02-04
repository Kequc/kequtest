const assert = require('assert');
const JobContainer = require('../../src/jobs/job-container.js');

const DESCRIPTION = 'fake description';

let parentHooks;
let originalKequtestContainer;

beforeEach(function () {
    parentHooks = { beforeEach: [], afterEach: [] };
    originalKequtestContainer = global.kequtest.container;
    global.kequtest.container = null;
});

afterEach(function () {
    // Make sure we're unsetting this again
    global.kequtest.container = originalKequtestContainer;
});

it('creates an instance', function () {
    const cb = () => {};
    const result = new JobContainer(DESCRIPTION, cb, 0);

    assert.strictEqual(result.description, DESCRIPTION);
    assert.strictEqual(result.cb, cb);
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

it('runs the callback sets container and displays output', async function () {
    const cb = util.spy();
    const log = util.log();
    const result = new JobContainer(DESCRIPTION, cb, 2);

    assert.strictEqual(cb.calls.length, 0);
    await result.run(log, parentHooks);
    assert.strictEqual(cb.calls.length, 1);

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

it('stops all mocks', async function () {
    const originalMockStop =  global.mock.stop;
    global.mock.stop = util.spy();

    const result = new JobContainer(DESCRIPTION, () => {}, 0);
    result.mocks = ['test1', 'test2'];

    await result.run(util.log(), parentHooks);

    assert.deepStrictEqual(global.mock.stop.calls, [['test1'], ['test2']]);

    global.mock.stop = originalMockStop;
});

it('runs beforeEach hooks', async function () {
    const result = new JobContainer(DESCRIPTION, () => {}, 0);
    result.hooks.beforeEach = [util.spy(), util.spy()];
    result.buffer = [{ run: util.spy() }, { run: util.spy() }];

    await result.run(util.log(), parentHooks);

    assert.strictEqual(result.hooks.beforeEach[0].calls.length, 2);
    assert.strictEqual(result.hooks.beforeEach[1].calls.length, 2);
});

it('runs afterEach hooks', async function () {
    const result = new JobContainer(DESCRIPTION, () => {}, 0);
    result.hooks.afterEach = [util.spy(), util.spy()];
    result.buffer = [{ run: util.spy() }, { run: util.spy() }];

    await result.run(util.log(), parentHooks);

    assert.strictEqual(result.hooks.afterEach[0].calls.length, 2);
    assert.strictEqual(result.hooks.afterEach[1].calls.length, 2);
});

it('skips beforeEach afterEach if buffer is a container', async function () {
    const job = new JobContainer('test2', () => {}, 1);

    const result = new JobContainer(DESCRIPTION, () => {}, 0);
    result.hooks.before = [util.spy()];
    result.hooks.beforeEach = [util.spy()];
    result.hooks.afterEach = [util.spy()];
    result.hooks.after = [util.spy()];
    result.buffer = [job];

    await result.run(util.log(), parentHooks);

    assert.strictEqual(result.hooks.before[0].calls.length, 1);
    assert.strictEqual(result.hooks.beforeEach[0].calls.length, 0);
    assert.strictEqual(result.hooks.afterEach[0].calls.length, 0);
    assert.strictEqual(result.hooks.after[0].calls.length, 1);
});

it('merges parentHooks', async function () {
    const result = new JobContainer(DESCRIPTION, () => {}, 0);
    parentHooks = { beforeEach: [util.spy()], afterEach: [util.spy()] };
    result.hooks.before = [util.spy()];
    result.hooks.beforeEach = [util.spy()];
    result.hooks.afterEach = [util.spy()];
    result.hooks.after = [util.spy()];
    result.buffer = [{ run: util.spy() }, { run: util.spy() }];

    await result.run(util.log(), parentHooks);

    assert.strictEqual(result.hooks.before[0].calls.length, 1);
    assert.strictEqual(parentHooks.beforeEach[0].calls.length, 2);
    assert.strictEqual(result.hooks.beforeEach[0].calls.length, 2);
    assert.strictEqual(result.hooks.afterEach[0].calls.length, 2);
    assert.strictEqual(parentHooks.afterEach[0].calls.length, 2);
    assert.strictEqual(result.hooks.after[0].calls.length, 1);
});

it('sends hooks along to children if buffer is a container', async function () {
    const job = new JobContainer('test2', () => {}, 1);
    job.run = util.spy();

    const result = new JobContainer(DESCRIPTION, () => {}, 0);
    parentHooks = { beforeEach: [util.spy(), util.spy()], afterEach: [util.spy(), util.spy()] };
    result.hooks.beforeEach = [util.spy(), util.spy()];
    result.hooks.afterEach = [util.spy(), util.spy()];
    result.buffer = [job];

    await result.run(util.log(), parentHooks);

    assert.strictEqual(parentHooks.beforeEach[0].calls.length, 0);
    assert.strictEqual(parentHooks.afterEach[0].calls.length, 0);
    assert.strictEqual(job.run.calls.length, 1);
    assert.deepStrictEqual(job.run.calls[0][1], {
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
