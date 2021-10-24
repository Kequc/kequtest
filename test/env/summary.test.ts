import '../../src'; // 'kequtest'
import assert from 'assert';
import CreateSummary from '../../src/env/summary';
import CreateContainerJob from '../../src/factory/container-job';
import { red } from '../../src/util/helpers';

it('produces test results', async function () {
    const summary = CreateSummary();
    const result = CreateContainerJob('container1');

    const errors = [
        new Error('error1'),
        new Error('error2'),
        new Error('error3')
    ];
    const containers = [
        result.addContainer('container2'),
        result.addContainer('container3')
    ];
    const jobs = [
        containers[0].addTest('test1', () => {}),
        containers[0].addTest('test2'),
        containers[1].addTest('test3', () => { throw errors[0]; }),
        containers[1].addContainer('container4', () => { throw errors[1]; }),
        result.addTest('test5', () => {}),
        result.addTest('test6', () => { throw errors[2]; })
    ];

    await result.run(summary, util.logger());

    assert.deepStrictEqual(summary, {
        ...summary,
        failures: [
            { error: errors[0], logs: [], tree: [result, containers[1], jobs[2]] },
            { error: errors[1], logs: [], tree: [result, containers[1], jobs[3]] },
            { error: errors[2], logs: [], tree: [result, jobs[5]] }
        ],
        failCount: 2,
        successCount: 2,
        missingCount: 1
    });
});

it('reports catastrophic error', async function () {
    const summary = CreateSummary();
    const error = new Error('error1');
    const result = CreateContainerJob('container1', () => { throw error; });

    await result.run(summary, util.logger());

    assert.deepStrictEqual(summary, {
        ...summary,
        failures: [
            { error, logs: [], tree: [result] },
        ],
        failCount: 0,
        successCount: 0,
        missingCount: 0
    });
});

describe('info', function () {
    it('prints a test summary', async function () {
        const summary = CreateSummary();
        const result = CreateContainerJob('test suite');
    
        await result.run(summary, util.logger());
    
        assert.strictEqual(summary.info(), '0/0 passing, 0 failures');
    });
    
    it('counts passing tests', async function () {
        const summary = CreateSummary();
        const result = CreateContainerJob('test suite');
    
        result.addTest('test1', () => {});
        result.addTest('test2', () => {});
    
        await result.run(summary, util.logger());
    
        assert.strictEqual(summary.info(), '2/2 passing, 0 failures');
    });
    
    it('counts failing tests', async function () {
        const summary = CreateSummary();
        const result = CreateContainerJob('test suite');
    
        result.addTest('test1', () => { throw new Error('error1'); });
        result.addTest('test2', () => { throw new Error('error2'); });
    
        await result.run(summary, util.logger());
    
        assert.strictEqual(summary.info(), red('0/2 passing, 2 failures'));
    });
    
    it('detects missing tests', async function () {
        const summary = CreateSummary();
        const result = CreateContainerJob('test suite');
    
        result.addTest('test1', undefined);
        result.addTest('test2', undefined);
    
        await result.run(summary, util.logger());
    
        assert.strictEqual(summary.info(), '0/0 passing, 2 missing, 0 failures');
    });
    
    it('detects container failures', async function () {
        const summary = CreateSummary();
        const result = CreateContainerJob('test suite');
    
        result.addContainer('test describe', () => { throw new Error('error1'); });
        result.addTest('test1', () => {});
    
        await result.run(summary, util.logger());
    
        assert.strictEqual(summary.info(), red('1/1 passing, 1 failure'));
    });
    
    it('counts tests deep', async function () {
        const summary = CreateSummary();
        const result = CreateContainerJob('test suite');
        const describe = result.addContainer('test describe');
    
        describe.addTest('test1', () => { throw new Error('error1'); });
        describe.addTest('test2', () => {});
        describe.addTest('test3', () => {});
    
        result.addTest('test4', () => { throw new Error('error2'); });
        result.addTest('test5', () => {});
    
        await result.run(summary, util.logger());
    
        assert.strictEqual(summary.info(), red('3/5 passing, 2 failures'));
    });
});
