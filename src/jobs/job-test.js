const Job = require('./job.js');
const { red, green, sequence } = require('../helpers.js');

class JobTest extends Job {
    async run (log, hooks) {
        await sequence(hooks.beforeEach);
        await super.run(log);
        await sequence(hooks.afterEach);
    }

    message () {
        const padding = (this.depth) * 2;
        return ('\u00B7 ' + this.description).padStart(this.description.length + padding) + this.postfix();
    }

    postfix () {
        if (this.error) return red(' \u2717');
        if (this.block === undefined) return green(' -- missing --');
        return green(' \u2713');
    }

    getData () {
        const result = super.getData();

        if (this.error) {
            result.failed++;
        } else if (this.block === undefined) {
            result.missing++;
        } else {
            result.passed++;
        }

        return result;
    }
}

module.exports = JobTest;
