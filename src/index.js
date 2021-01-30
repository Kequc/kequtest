#!/usr/bin/env node
const JobSuite = require('./jobs/job-suite.js');
const JobDescribe = require('./jobs/job-describe.js');
const JobIt = require('./jobs/job-it.js');

const findFiles = require('./find-files.js');
const summary = require('./summary.js');

process.env.NODE_ENV = process.env.NODE_ENV || 'test';

// GLOBAL
function describe (description, cb) {
    const job = global.kequtest.current;
    job.buffer.push(new JobDescribe(description, cb, job.depth + 1));
}

function it (description, cb) {
    const job = global.kequtest.current;
    job.buffer.push(new JobIt(description, cb, job.depth + 1));
}

global.kequtest = { current: null };
global.describe = describe;
global.it = it;
// ****

async function run () {
    console.log('');
    console.log('STARTING');

    const files = findFiles(process.cwd(), ['.test.js']);
    const suite = new JobSuite(files);

    await suite.run();

    console.log('FINISHED');
    summary(suite);
    console.log('');
}

run();
