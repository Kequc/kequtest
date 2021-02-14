const Job = require('./job.js');
const { sequence } = require('../helpers.js');

class JobContainer extends Job {
    constructor (...params) {
        super(...params);

        this.buffer = [];
        this.mocks = [];
        this.hooks = {
            before: [],
            beforeEach: [],
            afterEach: [],
            after: []
        };
    }

    async run (log, parentHooks) {
        global.kequtest.container = this;

        await this.runClientCode(log);

        if (this.error) {
            this.cleanup();
            return;
        }

        const treeHooks = getTreeHooks(parentHooks, this.hooks);

        try {
            await sequence(this.hooks.before);
            await sequence(this.buffer.map(job => queueJob(log, job, treeHooks)));
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
            return result;
        }

        for (const job of this.buffer) {
            for (const [key, value] of Object.entries(job.getScore())) {
                result[key] += value;
            }
        }

        return result;
    }
}

module.exports = JobContainer;

// Combine hooks
function getTreeHooks (parentHooks, hooks) {
    return {
        beforeEach: parentHooks.beforeEach.concat(hooks.beforeEach),
        afterEach: hooks.afterEach.concat(parentHooks.afterEach)
    };
}

function queueJob (log, job, treeHooks) {
    return async function () {
        await job.run(log, treeHooks);
    };
}
