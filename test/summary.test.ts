import assert from 'assert';
import JobContainer from '../src/jobs/job-container';
import JobTest from '../src/jobs/job-test';
import summary from '../src/summary';

it('prints a test summary', function () {
    const suite = new JobContainer('test suite', () => {}, 0);

    assert.strictEqual(summary(suite as any), '0/0 passing, 0 failures');
});

it('counts passing tests', function () {
    const suite = new JobContainer('test suite', () => {}, 0);

    suite.buffer = [
        new JobTest('test1', () => {}, 1),
        new JobTest('test2', () => {}, 1)
    ];

    assert.strictEqual(summary(suite as any), '2/2 passing, 0 failures');
});

it('counts failing tests', function () {
    const suite = new JobContainer('test suite', () => {}, 0);

    suite.buffer = [
        new JobTest('test1', () => {}, 1),
        new JobTest('test2', () => {}, 1)
    ];
    suite.buffer[0].error = new Error('error1');
    suite.buffer[1].error = new Error('error2');

    assert.strictEqual(summary(suite as any), '\x1b[31m0/2 passing, 2 failures\x1b[0m');
});

it('detects missing tests', function () {
    const suite = new JobContainer('test suite', () => {}, 0);

    suite.buffer = [
        new JobTest('test1', undefined, 1),
        new JobTest('test2', undefined, 1)
    ];

    assert.strictEqual(summary(suite as any), '0/0 passing, 2 missing, 0 failures');
});

it('detects catastrophic failures', function () {
    const suite = new JobContainer('test suite', () => {}, 0);
    const describe = new JobContainer('test describe', () => {}, 1);

    suite.buffer = [
        describe,
        new JobTest('test1', () => {}, 1)
    ];
    describe.error = new Error('error1');

    assert.strictEqual(summary(suite as any), '\x1b[31m1/1 passing, 0 failures, 1 catastrophic failure\x1b[0m');
});

it('counts tests deep', function () {
    const suite = new JobContainer('test suite', () => {}, 0);
    const describe = new JobContainer('test describe', () => {}, 1);
    describe.buffer = [
        new JobTest('test1', () => {}, 2),
        new JobTest('test2', () => {}, 2),
        new JobTest('test3', () => {}, 2)
    ];
    suite.buffer = [
        describe,
        new JobTest('test4', () => {}, 1),
        new JobTest('test5', () => {}, 1)
    ];
    describe.buffer[0].error = new Error('error1');
    suite.buffer[1].error = new Error('error2');

    assert.strictEqual(summary(suite as any), '\x1b[31m3/5 passing, 2 failures\x1b[0m');
});
