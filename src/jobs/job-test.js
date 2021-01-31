const Job = require('./job.js');

class JobTest extends Job {
    message () {
        if (this.error) {
            return `${super.message()} \x1b[31m\u2717\x1b[0m`;
        } else {
            return `${super.message()} \x1b[32m\u2713\x1b[0m`;
        }
    }
}

module.exports = JobTest;
