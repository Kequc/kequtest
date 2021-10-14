import assert from 'assert';
import CreateContainerJob from '../src/factory/container-job';
import CreateTestJob from '../src/factory/test-job';
import summary from '../src/summary';

it('prints a test summary', async function () {
    const suite = CreateContainerJob('test suite', () => {});

    await suite.run(util.log());

    assert.strictEqual(summary(suite), '0/0 passing, 0 failures');
});

it('counts passing tests', async function () {
    const suite = CreateContainerJob('test suite', () => {});

    suite.addJob(CreateTestJob('test1', () => {}));
    suite.addJob(CreateTestJob('test2', () => {}));

    await suite.run(util.log());

    assert.strictEqual(summary(suite), '2/2 passing, 0 failures');
});

it('counts failing tests', async function () {
    const suite = CreateContainerJob('test suite', () => {});

    suite.addJob(CreateTestJob('test1', () => { throw new Error('error1'); }));
    suite.addJob(CreateTestJob('test2', () => { throw new Error('error2'); }));

    await suite.run(util.log());

    assert.strictEqual(summary(suite), '\x1b[31m0/2 passing, 2 failures\x1b[0m');
});

it('detects missing tests', async function () {
    const suite = CreateContainerJob('test suite', () => {});

    suite.addJob(CreateTestJob('test1', undefined));
    suite.addJob(CreateTestJob('test2', undefined));

    await suite.run(util.log());

    assert.strictEqual(summary(suite), '0/0 passing, 2 missing, 0 failures');
});

it('detects catastrophic failures', async function () {
    const suite = CreateContainerJob('test suite', () => {});
    const describe = CreateContainerJob('test describe', () => { throw new Error('error1'); });

    suite.addJob(describe);
    suite.addJob(CreateTestJob('test1', () => {}));

    await suite.run(util.log());

    assert.strictEqual(summary(suite), '\x1b[31m1/1 passing, 0 failures, 1 catastrophic failure\x1b[0m');
});

it('counts tests deep', async function () {
    const suite = CreateContainerJob('test suite', () => {});
    const describe = CreateContainerJob('test describe', () => {});

    describe.addJob(CreateTestJob('test1', () => { throw new Error('error1'); }));
    describe.addJob(CreateTestJob('test2', () => {}));
    describe.addJob(CreateTestJob('test3', () => {}));

    suite.addJob(describe);
    suite.addJob(CreateTestJob('test4', () => { throw new Error('error2'); }));
    suite.addJob(CreateTestJob('test5', () => {}));

    await suite.run(util.log());

    assert.strictEqual(summary(suite), '\x1b[31m3/5 passing, 2 failures\x1b[0m');
});
