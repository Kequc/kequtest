const Job = require('./job.js');
const { red, green } = require('../helpers.js');

class JobTest extends Job {
    message () {
        const text = addDot(super.message(), this.depth);
        const postfix = (this.error ? red(' \u2717') : green(' \u2713'));
        return text + postfix;
    }
}

function addDot (str, depth) {
    const index = (depth * 2) - 2;
    return str.substr(0, index) + '\u00B7' + str.substr(index + 1);
}

module.exports = JobTest;
