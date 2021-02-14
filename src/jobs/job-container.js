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

    async run (log, clientHooks) {
        global.kequtest.container = this;

        await this.clientCode(log);

        if (this.error) {
            this.cleanup();
            return;
        }

        // Hooks up the tree
        const treeClientHooks = {
            beforeEach: clientHooks.beforeEach.concat(this.hooks.beforeEach),
            afterEach: this.hooks.afterEach.concat(clientHooks.afterEach)
        };

        try {
            await sequence(this.hooks.before);
            await sequence(this.buffer.map(job => queueJob(log, job, treeClientHooks)));
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

    getScore () {
        const result = super.getScore();

        if (this.error) {
            result.catastrophic++;
        } else {
            for (const job of this.buffer) {
                for (const [key, value] of Object.entries(job.getScore())) {
                    result[key] += value;
                }
            }
        }

        return result;
    }
}

module.exports = JobContainer;

function queueJob (log, job, clientHooks) {
    return async function () {
        await job.run(log, clientHooks);
    };
}
