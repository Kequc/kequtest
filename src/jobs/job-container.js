const Job = require('./job.js');
const { sequence } = require('../helpers.js');

class JobContainer extends Job {
    constructor (...params) {
        super(...params);

        this.buffer = [];
        this.hooks = {
            before: [],
            beforeEach: [],
            afterEach: [],
            after: []
        };
        this.mocks = [];
    }

    async run (log, hooks) {
        global.kequtest.container = this;

        await super.run(log);

        if (this.error) {
            this.buffer = [];
            this.cleanup();
            return;
        }

        // Hooks up the tree
        const treeHooks = {
            beforeEach: hooks.beforeEach.concat(this.hooks.beforeEach),
            afterEach: this.hooks.afterEach.concat(hooks.afterEach)
        };

        try {
            await sequence(this.hooks.before);
            await sequence(this.buffer.map(job => queue(log, job, treeHooks)));
            await sequence(this.hooks.after);
        } catch (error) {
            this.error = error;
            log.info('');
            log.error(error);
            log.info('');
        }

        this.cleanup();
    }

    cleanup () {
        for (const mock of this.mocks) {
            global.util.mock.stop(mock);
        }
    }

    getData () {
        const result = super.getData();

        if (this.error) {
            result.catastrophic++;
        }

        for (const job of this.buffer) {
            for (const [key, value] of Object.entries(job.getData())) {
                result[key] += value;
            }
        }

        return result;
    }
}

function queue (log, job, treeHooks) {
    return async function () {
        await job.run(log, treeHooks);
    };
}

module.exports = JobContainer;
