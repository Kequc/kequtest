const Job = require('./job.js');
const { red, green } = require('../helpers.js');

class JobTest extends Job {
    message () {
        const padding = (this.depth) * 2;
        return ('\u00B7 ' + this.description).padStart(this.description.length + padding) + this.postfix();
    }

    postfix () {
        if (this.error) return red(' \u2717');
        if (typeof this.cb !== 'function') return red(' - missing -');
        return green(' \u2713');
    }
}

module.exports = JobTest;
