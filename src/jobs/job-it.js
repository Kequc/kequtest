const Job = require('./job.js');

class JobIt extends Job {
    message () {
        return super.message() + (this.error ? ' \x1b[31m\u2717\x1b[0m' : ' \x1b[32m\u2713\x1b[0m');
    }
}

module.exports = JobIt;
