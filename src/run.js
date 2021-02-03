const JobSuite = require('./jobs/job-suite.js');
const JobContainer = require('./jobs/job-container.js');
const JobTest = require('./jobs/job-test.js');

const findFiles = require('./find-files.js');
const summary = require('./summary.js');
const util = require('./util.js');

process.env.NODE_ENV = process.env.NODE_ENV || 'test';

// GLOBAL
function describe (description, cb) {
    const job = global.kequtest.current;
    job.buffer.push(new JobContainer(description, cb, job.depth + 1));
}

function it (description, cb) {
    const job = global.kequtest.current;
    job.buffer.push(new JobTest(description, cb, job.depth + 1));
}

global.kequtest = { current: null };
global.describe = describe;
global.it = it;
global.hook = {};
global.util = util;

function hook (name) {
    global.hook[name] = function (cb) {
        const job = global.kequtest.current;
        job.hooks[name].push(cb);
    };
}

hook('before');
hook('beforeEach');
hook('afterEach');
hook('after');
// ****

async function run (log = console) {
    log.info('STARTING');

    const files = findFiles(process.cwd(), process.argv[2], ['.test.js'], log);
    const suite = new JobSuite(files);

    await suite.run(log, { beforeEach: [], afterEach : [] });

    log.info('FINISHED');
    summary(suite);
    log.info('');
}

module.exports = run;
