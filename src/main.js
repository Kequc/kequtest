const JobSuite = require('./jobs/job-suite.js');
const JobContainer = require('./jobs/job-container.js');
const JobTest = require('./jobs/job-test.js');

const findFilenames = require('./find-filenames.js');
const summary = require('./summary.js');

process.env.NODE_ENV = process.env.NODE_ENV || 'test';

// GLOBAL
function describe (description, block) {
    const { container } = global.kequtest;
    container.buffer.push(new JobContainer(description, block, container.depth + 1));
}

function it (description, block) {
    const { container } = global.kequtest;
    container.buffer.push(new JobTest(description, block, container.depth + 1));
}

global.kequtest = { filename: null, container: null };
global.describe = describe;
global.it = it;
global.util = require('./util/util.js');

function hook (name) {
    global[name] = function (block) {
        const { container } = global.kequtest;
        container.hooks[name].push(block);
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

    const suite = new JobSuite(absolute, findFilenames(log, absolute, exts));
    await suite.run(log);

    log.info('FINISHED');
    summary(log, suite);

    log.info('');
}

module.exports = main;
