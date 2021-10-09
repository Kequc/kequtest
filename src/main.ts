import JobSuite from './jobs/job-suite';
import JobContainer from './jobs/job-container';
import JobTest from './jobs/job-test';

import findFilenames from './find-filenames';
import summary from './summary';
import { mock, uncache } from './util/mock';
import { log, spy } from './util/spy';

import { Block, Logger } from '../types';

// default test env
process.env.NODE_ENV = process.env.NODE_ENV || 'test';

// administrative
export const administrative: {
    filename: string | null,
    container: JobContainer | null
} = { filename: null, container: null };


// GLOBAL ****
function describe (description: string, block: Block) {
    // populate buffer when run
    const { container } = administrative;
    container!.buffer.push(new JobContainer(description, block, container!.depth + 1));
}
global.describe = describe;

function it (description: string, block: Block) {
    // populate buffer when run
    const { container } = administrative;
    container!.buffer.push(new JobTest(description, block, container!.depth + 1));
}
global.it = it;

function createHook (name: string) {
    global[name] = function (block: Block) {
        const { container } = administrative;
        container!.hooks[name].push(block);
    };
}

createHook('before');
createHook('beforeEach');
createHook('afterEach');
createHook('after');

global.util = { mock, uncache, log, spy };
// ****


async function main (log: Logger, absolutes: string[], exts: string[]): Promise<void> {
    log.info('STARTING');
    log.info('');

    for (const absolute of absolutes) {
        log.info('> ' + absolute);
    }

    const filenames = findFilenames(log, absolutes, exts);
    const suite = new JobSuite(filenames);

    await suite.run(log);
    log.info('');

    log.info('FINISHED');
    log.info(summary(suite));
    log.info('');
}

export default main;
