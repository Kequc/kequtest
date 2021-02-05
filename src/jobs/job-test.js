const Job = require('./job.js');
const { red, green } = require('../helpers.js');

class JobTest extends Job {
    message () {
        const padding = (this.depth) * 2;
        const postfix = (this.error ? red(' \u2717') : green(' \u2713'));
        return ('\u00B7 ' + this.description).padStart(this.description.length + padding) + postfix;
    }
}

module.exports = JobTest;
