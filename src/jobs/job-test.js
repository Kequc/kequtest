const Job = require('./job.js');

class JobTest extends Job {
    message () {
        const postfix = (this.error ? ' \x1b[31m\u2717\x1b[0m' : ' \x1b[32m\u2713\x1b[0m');
        return super.message() + postfix;
    }
}

module.exports = JobTest;
