const path = require('path');

const JobSuite = require('./jobs/job-suite.js');
const JobContainer = require('./jobs/job-container.js');
const JobTest = require('./jobs/job-test.js');

const findFiles = require('./find-files.js');
const summary = require('./summary.js');
const util = require('./util.js');

process.env.NODE_ENV = process.env.NODE_ENV || 'test';

// GLOBAL
function describe (description, cb) {
    const container = global.kequtest.container;
    container.buffer.push(new JobContainer(description, cb, container.depth + 1));
}

function it (description, cb) {
    const container = global.kequtest.container;
    container.buffer.push(new JobTest(description, cb, container.depth + 1));
}

global.kequtest = { container: null };
global.describe = describe;
global.it = it;
global.util = util;

function hook (name) {
    global[name] = function (cb) {
        const container = global.kequtest.container;
        container.hooks[name].push(cb);
    };
}

hook('before');
hook('beforeEach');
hook('afterEach');
hook('after');
// ****

async function run (log = console) {
    const directory = path.join(process.cwd(), process.argv[2] || '.');

    log.info('STARTING');
    log.info('> ' + directory);

    const files = findFiles(log, directory, ['.test.js']);
    const suite = new JobSuite(directory, files);

    await suite.run(log, { beforeEach: [], afterEach : [] });

    log.info('FINISHED');
    summary(log, suite);
    log.info('');
}

module.exports = run;