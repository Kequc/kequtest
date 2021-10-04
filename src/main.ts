import JobSuite from './jobs/job-suite';
import JobContainer from './jobs/job-container';
import JobTest from './jobs/job-test';

import findFilenames from './find-filenames';
import summary from './summary';
import util from './util/util';

import { IDescribe, IHook, ITest, Logger } from '../types/main';

// default test env
process.env.NODE_ENV = process.env.NODE_ENV || 'test';

// GLOBAL ****
function describe (description: string, block: IDescribe) {
    // populate buffer when run
    const { container } = global.kequtest;
    container.buffer.push(new JobContainer(description, block, container.depth + 1));
}

function it (description: string, block: ITest) {
    // populate buffer when run
    const { container } = global.kequtest;
    container.buffer.push(new JobTest(description, block, container.depth + 1));
}

// administrative
global.kequtest = { filename: null, container: null };

// client tools
global.describe = describe;
global.it = it;
global.util = util;

// hooks
function hook (name) {
    global[name] = function (block: IHook) {
        const { container } = global.kequtest;
        container.hooks[name].push(block);
    };
}
hook('before');
hook('beforeEach');
hook('afterEach');
hook('after');
// ****


async function main (log: Logger, absolute: string, exts: string[]) {
    log.info('STARTING');
    log.info('> ' + absolute);

    const filenames = findFilenames(log, absolute, exts);
    const suite = new JobSuite(absolute, filenames);

    await suite.run(log);

    log.info('FINISHED');
    log.info(summary(suite));
    log.info('');
}

export default main;
