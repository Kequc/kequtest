import JobSuite from './jobs/job-suite';
import JobContainer from './jobs/job-container';
import JobTest from './jobs/job-test';

import findFilenames from './find-filenames';
import summary from './summary';
import * as util from './util/util';

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

function it (description: string, block: Block) {
    // populate buffer when run
    const { container } = administrative;
    container!.buffer.push(new JobTest(description, block, container!.depth + 1));
}

// client tools
global.describe = describe;
global.it = it;
global.util = util;

// hooks
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
