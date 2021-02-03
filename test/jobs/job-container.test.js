const assert = require('assert');
const JobContainer = require('../../src/jobs/job-container.js');

const DESCRIPTION = 'fake description';

let parentHooks;
let originalKequtestCurrent;

hook.beforeEach(function () {
    parentHooks = { beforeEach: [], afterEach: [] };
    originalKequtestCurrent = global.kequtest.current;
    global.kequtest.current = null;
});

hook.afterEach(function () {
    // Make sure we're unsetting this again
    global.kequtest.current = originalKequtestCurrent;
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
});

it('runs the callback sets current and displays output', async function () {
    const cb = util.spy();
    const result = new JobContainer(DESCRIPTION, cb, 2);
    assert.strictEqual(cb.calls.length, 0);
    const log = util.log();
    await result.run(log, parentHooks);
    assert.strictEqual(result.error, null);
    assert.strictEqual(cb.calls.length, 1);
    assert.strictEqual(global.kequtest.current, result);
    assert.deepStrictEqual(log.info.calls, [
        ['  \u00B7 ' + DESCRIPTION]
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
    const result = new JobContainer(DESCRIPTION, () => {}, 0);
    result.hooks.before = [util.spy()];
    result.hooks.beforeEach = [util.spy()];
    result.hooks.afterEach = [util.spy()];
    result.hooks.after = [util.spy()];
    result.buffer = [new JobContainer('test2', () => {}, 1)];
    await result.run(util.log(), parentHooks);
    assert.strictEqual(result.hooks.before[0].calls.length, 1);
    assert.strictEqual(result.hooks.beforeEach[0].calls.length, 0);
    assert.strictEqual(result.hooks.afterEach[0].calls.length, 0);
    assert.strictEqual(result.hooks.after[0].calls.length, 1);
});
