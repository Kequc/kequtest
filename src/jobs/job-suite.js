const Job = require('./job.js');

function NOOP () {}

class JobSuite extends Job {
    constructor (files) {
        super('', NOOP, -1);
        this.buffer = files.map(file => new JobFile(file));
    }

    print () {
        console.log(`Found ${this.buffer.length} test files...`);
    }
}

class JobFile extends Job {
    constructor (file) {
        super(file.split('/').pop(), () => { require(file); }, 0);
    }

    beforeStart () {
        global.kequtest.current = this;
    }
}

module.exports = JobSuite;
