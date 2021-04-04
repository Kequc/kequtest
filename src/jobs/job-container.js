const Job = require('./job.js');

// everything other than an actual test
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
        this.caches = [];
    }

    async run (log, parentHooks) {
        // track active container
        global.kequtest.container = this;

        // initialize
        await this.runClientCode(log);

        if (this.error) {
            // initialization threw catastrophic error
            this.cleanup();
            return;
        }

        // beforeEach and afterEach hooks from all ancestors
        const treeHooks = getTreeHooks(parentHooks, this.hooks);

        try {
            // sequence
            for (const before of this.hooks.before) await before();
            // sequence
            for (const job of this.buffer) await job.run(log, treeHooks);
            // sequence
            for (const after of this.hooks.after) await after();
        } catch (error) {
            // hook threw catastrophic error
            this.error = error;
            log.info('');
            log.error(error);
            log.info('');
        }

        this.cleanup();
    }

    // remove all mocks and caches
    cleanup () {
        for (const mock of this.mocks) {
            global.util.mock.stop(mock);
        }
        for (const cache of this.caches) {
            global.util.uncache(cache);
        }
    }

    // total score for children
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

// combine hooks
function getTreeHooks (parentHooks, hooks) {
    return {
        beforeEach: parentHooks.beforeEach.concat(hooks.beforeEach),
        afterEach: hooks.afterEach.concat(parentHooks.afterEach)
    };
}
