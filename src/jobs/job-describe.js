const Job = require('./job.js');

class JobDescribe extends Job {
    beforeStart () {
        global.kequtest.current = this;
    }
}

module.exports = JobDescribe;
