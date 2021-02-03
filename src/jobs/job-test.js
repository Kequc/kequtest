const Job = require('./job.js');

class JobTest extends Job {
    message () {
        const postfix = (this.error ? ' \x1b[31m\u2717\x1b[0m' : ' \x1b[32m\u2713\x1b[0m');
        return addDot(super.message(), this.depth) + postfix;
    }
}

function addDot (str, depth) {
    const index = (depth * 2) - 2;
    return str.substr(0, index) + '\u00B7' + str.substr(index + 1);
}

module.exports = JobTest;
