const assert = require('assert');
const JobContainer = require('../src/jobs/job-container.js');
const summary = require('../src/summary.js');

it('prints a test summary', function () {
    const log = util.log();
    const suite = new JobContainer('test suite', () => {}, 0);

    summary(log, suite);

    assert.deepStrictEqual(log.info.calls, [
        ['0/0 passing, 0 failures']
    ]);
});

it('counts passing tests', function () {
    const log = util.log();
    const suite = new JobContainer('test suite', () => {}, 0);
    suite.buffer = [
        { error: null },
        { error: null }
    ];

    summary(log, suite);

    assert.deepStrictEqual(log.info.calls, [
        ['2/2 passing, 0 failures']
    ]);
});

it('counts failing tests', function () {
    const log = util.log();
    const suite = new JobContainer('test suite', () => {}, 0);
    suite.buffer = [
        { error: new Error('test1') },
        { error: new Error('test2') }
    ];

    summary(log, suite);

    assert.deepStrictEqual(log.info.calls, [
        ['\x1b[31m0/2 passing, 2 failures\x1b[0m']
    ]);
});

it('detects catastrophic failures', function () {
    const log = util.log();
    const suite = new JobContainer('test suite', () => {}, 0);
    const describe = new JobContainer('test describe', () => {}, 1);
    describe.error = new Error('test1');
    suite.buffer = [
        describe,
        { error: null }
    ];

    summary(log, suite);

    assert.deepStrictEqual(log.info.calls, [
        ['1/1 passing, 0 failures'],
        ['\x1b[31m1 catastrophic failure\x1b[0m']
    ]);
});

it('counts tests deep', function () {
    const log = util.log();
    const suite = new JobContainer('test suite', () => {}, 0);
    const describe = new JobContainer('test describe', () => {}, 1);
    describe.buffer = [
        { error: new Error('test1') },
        { error: null },
        { error: null }
    ];
    suite.buffer = [
        describe,
        { error: new Error('test2') },
        { error: null }
    ];

    summary(log, suite);

    assert.deepStrictEqual(log.info.calls, [
        ['\x1b[31m3/5 passing, 2 failures\x1b[0m']
    ]);
});
