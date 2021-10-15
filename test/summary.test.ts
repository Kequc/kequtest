import assert from 'assert';
import CreateContainerJob from '../src/factory/container-job';
import CreateSummary from '../src/env/summary';

it('prints a test summary', async function () {
    const suite = CreateContainerJob('test suite');

    await suite.run(util.logger());

    assert.strictEqual(summary(suite), '0/0 passing, 0 failures');
});

it('counts passing tests', async function () {
    const suite = CreateContainerJob('test suite');

    suite.addTest('test1', () => {});
    suite.addTest('test2', () => {});

    await suite.run(util.logger());

    assert.strictEqual(summary(suite), '2/2 passing, 0 failures');
});

it('counts failing tests', async function () {
    const suite = CreateContainerJob('test suite');

    suite.addTest('test1', () => { throw new Error('error1'); });
    suite.addTest('test2', () => { throw new Error('error2'); });

    await suite.run(util.logger());

    assert.strictEqual(summary(suite), '\x1b[31m0/2 passing, 2 failures\x1b[0m');
});

it('detects missing tests', async function () {
    const suite = CreateContainerJob('test suite');

    suite.addTest('test1', undefined);
    suite.addTest('test2', undefined);

    await suite.run(util.logger());

    assert.strictEqual(summary(suite), '0/0 passing, 2 missing, 0 failures');
});

it('detects catastrophic failures', async function () {
    const suite = CreateContainerJob('test suite');

    suite.addContainer('test describe', () => { throw new Error('error1'); });
    suite.addTest('test1', () => {});

    await suite.run(util.logger());

    assert.strictEqual(summary(suite), '\x1b[31m1/1 passing, 0 failures, 1 catastrophic failure\x1b[0m');
});

it('counts tests deep', async function () {
    const suite = CreateContainerJob('test suite');
    const describe = suite.addContainer('test describe');

    describe.addTest('test1', () => { throw new Error('error1'); });
    describe.addTest('test2', () => {});
    describe.addTest('test3', () => {});

    suite.addTest('test4', () => { throw new Error('error2'); });
    suite.addTest('test5', () => {});

    await suite.run(util.logger());

    assert.strictEqual(summary(suite), '\x1b[31m3/5 passing, 2 failures\x1b[0m');
});
