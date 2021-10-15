import CreateFakeLogger from './env/fake-logger';
import CreateMocker from './env/mocker';
import CreateSummary, { SummaryFailure } from './env/summary';
import CreateSuiteJob from './factory/suite-job';
import { HookType } from './util/constants';
import findFilenames from './util/find-filenames';
import { logger, spy } from './util/spy';

import { AsyncFunc, Logger } from '../types';

process.env.NODE_ENV = process.env.NODE_ENV || 'test';

// env
const fakeLogger = CreateFakeLogger();
const summary = CreateSummary(fakeLogger);
const { mock, uncache } = CreateMocker(summary);

// client
function describe (description: string, block?: AsyncFunc) {
    const { container } = summary;
    if (container) container.addContainer(description, block);
}

function it (description: string, block?: AsyncFunc) {
    const { container } = summary;
    if (container) container.addTest(description, block);
}

function createHook (hookType: HookType) {
    return function (block: AsyncFunc) {
        const { container } = summary;
        if (container) container.addHook(hookType, block);
    };
}

global.describe = describe;
global.it = it;
global.before = createHook(HookType.BEFORE);
global.beforeEach = createHook(HookType.BEFORE_EACH);
global.afterEach = createHook(HookType.AFTER_EACH);
global.after = createHook(HookType.AFTER);
global.util = {
    mock,
    uncache,
    logger,
    spy
};

// kequtest
async function main (logger: Logger, absolutes: string[], exts: string[]): Promise<void> {
    const separator = '-'.repeat(process.stdout.columns);

    logger.info('STARTING');
    logger.debug(separator);
    logger.info('');

    for (const absolute of absolutes) {
        logger.info('> ' + absolute);
    }

    const filenames = findFilenames(logger, absolutes, exts);
    const suite = CreateSuiteJob(summary, logger, filenames);

    // take over console
    global.console = fakeLogger.console;

    await suite.run(summary, logger);

    if ((summary.problems.length) > 0) {
        logger.info('');
        logger.debug(separator);
        renderProblems(logger);
    }

    logger.info('');
    logger.debug(separator);
    logger.info('FINISHED');
    logger.info(summary.info());
    logger.info('');
}

export default main;

function renderProblems (logger: Logger) {
    for (const problem of summary.problems) {
        for (const failure of problem.failures) {
            renderFailure(problem.filename, failure, logger);
        }
    }
}

function renderFailure (filename: string, failure: SummaryFailure, logger: Logger) {
    logger.info('');
    logger.info(filename);
    logger.info(failure.description);

    if (failure.logs.length > 0) {
        logger.info('');
        for (const log of failure.logs) {
            logger[log.key](...log.params);
        }
    }

    logger.info('');
    logger.error(failure.error);
}
