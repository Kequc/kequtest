import '../../src'; // 'kequtest'
import assert from 'assert';
import CreateSummary from '../../src/env/summary';
import CreateTestJob from '../../src/factory/test-job';
import { CHARS } from '../../src/util/constants';
import { green, red } from '../../src/util/helpers';

it('allows block to be undefined', function () {
    CreateTestJob('test1');
});

it('throws an error when description is invalid', function () {
    assert.throws(() => { CreateTestJob(undefined); }, { message: /^Description must be a string/ });
    assert.throws(() => { CreateTestJob(null); }, { message: /^Description must be a string/ });
    assert.throws(() => { CreateTestJob(100 as any); }, { message: /^Description must be a string/ });
});

it('throws an error when block is invalid', function () {
    assert.throws(() => { CreateTestJob('test1', null); }, { message: /^Block must be a function/ });
    assert.throws(() => { CreateTestJob('test1', 100 as any); }, { message: /^Block must be a function/ });
});

it('displays output', async function () {
    const logger = util.logger();
    const summary = CreateSummary();
    const result = CreateTestJob('test1', () => {});

    await result.run(summary, logger);

    assert.deepStrictEqual(logger.info.calls, [
        [CHARS.test + ' test1 '+ green(CHARS.success)]
    ]);
    assert.strictEqual(summary.failCount, 0);
    assert.strictEqual(summary.successCount, 1);
    assert.strictEqual(summary.missingCount, 0);
    assert.deepStrictEqual(summary.failures, []);
});

it('displays output when block fails', async function () {
    const error = new Error('error1');
    const logger = util.logger();
    const summary = CreateSummary();
    const result = CreateTestJob('test1', () => { throw error; });

    await result.run(summary, logger);

    assert.deepStrictEqual(logger.info.calls, [
        [CHARS.test + ' test1 ' + red(CHARS.fail)]
    ]);
    assert.strictEqual(summary.failCount, 1);
    assert.strictEqual(summary.successCount, 0);
    assert.strictEqual(summary.missingCount, 0);
    assert.deepStrictEqual(summary.failures, [
        { error, logs: [], tree: [result] }
    ]);
});

it('displays output when block is undefined', async function () {
    const logger = util.logger();
    const summary = CreateSummary();
    const result = CreateTestJob('test1');

    await result.run(summary, logger);

    assert.deepStrictEqual(logger.info.calls, [
        [CHARS.test + ' test1 ' + green('-- missing --')]
    ]);
    assert.strictEqual(summary.failCount, 0);
    assert.strictEqual(summary.successCount, 0);
    assert.strictEqual(summary.missingCount, 1);
    assert.deepStrictEqual(summary.failures, []);
});

it('captures console information when block fails', async function () {
    const error = new Error('error1');
    const logger = util.logger();
    const summary = CreateSummary();
    const result = CreateTestJob('test1', () => {
        console.log('fake log');
        console.warn('fake warn');
        console.error('fake error');
        console.info('fake info');
        console.debug('fake debug');
        throw error;
    });

    await result.run(summary, logger);

    assert.deepStrictEqual(logger.info.calls, [
        [CHARS.test + ' test1 ' + red(CHARS.fail)]
    ]);
    assert.strictEqual(summary.failCount, 1);
    assert.strictEqual(summary.successCount, 0);
    assert.strictEqual(summary.missingCount, 0);
    assert.deepStrictEqual(summary.failures, [{
        error,
        logs: [
            { key: 'log', params: ['fake log'] },
            { key: 'warn', params: ['fake warn'] },
            { key: 'error', params: ['fake error'] },
            { key: 'info', params: ['fake info'] },
            { key: 'debug', params: ['fake debug'] },
        ],
        tree: [result]
    }]);
});
