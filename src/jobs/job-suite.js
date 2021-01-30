const Job = require('./job.js');

function NOOP () {}

class JobSuite extends Job {
    constructor () {
        super('', NOOP, -1);
    }

    load (files) {
        this.buffer = files.map(file => new JobFile(file));
    }

    print () {
    }
}

class JobFile extends Job {
    constructor (file) {
        super(file.split('/').pop(), () => { require(file); }, 0)
    }
}

module.exports = JobSuite;
