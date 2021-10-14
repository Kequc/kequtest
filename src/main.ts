import CreateSuiteJob from './factory/suite-job';
import { mock, uncache } from './util/mock';
import { log, spy } from './util/spy';
import findFilenames from './find-filenames';
import { HookType } from './helpers';
import summary from './summary';

import { Administrative, AsyncFunc, Logger } from '../types';

// default test env
process.env.NODE_ENV = process.env.NODE_ENV || 'test';

// administrative
export const administrative: Administrative = {
    filename: null,
    container: null
};

// GLOBAL ****
function describe (description: string, block?: AsyncFunc) {
    // populate buffer when run
    const { container } = administrative;
    if (container) container.addContainer(description, block);
}
global.describe = describe;

function it (description: string, block?: AsyncFunc) {
    // populate buffer when run
    const { container } = administrative;
    if (container) container.addTest(description, block);
}
global.it = it;

function createHook (hookType: HookType) {
    return function (block: AsyncFunc) {
        const { container } = administrative;
        if (container) container.addHook(hookType, block);
    };
}
global.before = createHook(HookType.BEFORE);
global.beforeEach = createHook(HookType.BEFORE_EACH);
global.afterEach = createHook(HookType.AFTER_EACH);
global.after = createHook(HookType.AFTER);

global.util = { mock, uncache, log, spy };
// ****

async function main (log: Logger, absolutes: string[], exts: string[]): Promise<void> {
    log.info('STARTING');
    log.debug('-'.repeat(process.stdout.columns));
    log.info('');

    for (const absolute of absolutes) {
        log.info('> ' + absolute);
    }

    const filenames = findFilenames(log, absolutes, exts);
    const suite = CreateSuiteJob(filenames);

    await suite.run(log);

    log.info('');
    log.debug('-'.repeat(process.stdout.columns));
    log.info('FINISHED');
    log.info(summary(suite));
    log.info('');
}

export default main;
