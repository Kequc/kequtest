const JobSuite = require('./jobs/job-suite.js');
const JobContainer = require('./jobs/job-container.js');
const JobTest = require('./jobs/job-test.js');

const findFilenames = require('./find-filenames.js');
const summary = require('./summary.js');

process.env.NODE_ENV = process.env.NODE_ENV || 'test';

// GLOBAL
function describe (description, cb) {
    if (typeof description !== 'string') {
        throw new Error(`Description must be a string got ${typeof description} instead.`);
    }
    if (cb !== undefined && typeof cb !== 'function') {
        throw new Error(`Container must be a function got ${typeof cb} instead.`);
    }
    const { container } = global.kequtest;
    container.buffer.push(new JobContainer(description, cb, container.depth + 1));
}

function it (description, cb) {
    if (typeof description !== 'string') {
        throw new Error(`Description must be a string got ${typeof description} instead.`);
    }
    if (cb !== undefined && typeof cb !== 'function') {
        throw new Error(`Test must be a function got ${typeof cb} instead.`);
    }
    const { container } = global.kequtest;
    container.buffer.push(new JobTest(description, cb, container.depth + 1));
}

global.kequtest = { filename: null, container: null };
global.describe = describe;
global.it = it;
global.util = require('./utils/util.js');

function hook (name) {
    global[name] = function (cb) {
        const { container } = global.kequtest;
        container.hooks[name].push(cb);
    };
}

hook('before');
hook('beforeEach');
hook('afterEach');
hook('after');
// ****

async function main (log, absolute, exts) {
    log.info('STARTING');
    log.info('> ' + absolute);

    const filenames = findFilenames(log, absolute, exts);
    const suite = new JobSuite(absolute, filenames);
    await suite.run(log);

    log.info('FINISHED');
    summary(log, suite);
    log.info('');
}

module.exports = main;
