const Job = require('./job.js');

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

        await super.run(log);

        if (this.error) {
            this.buffer = [];
            this.cleanup();
            return;
        }

        // Looking at all the hooks up the tree
        const hooks = {
            beforeEach: parentHooks.beforeEach.concat(this.hooks.beforeEach),
            afterEach: this.hooks.afterEach.concat(parentHooks.afterEach)
        };

        try {
            await sequence(this.hooks.before);
            await sequence(this.buffer.map(job => buildJob(log, job, hooks)));
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
}

function buildJob (log, job, hooks) {
    return async () => {
        if (job instanceof JobContainer) {
            await job.run(log, hooks);
        } else {
            await sequence(hooks.beforeEach);
            await job.run(log);
            await sequence(hooks.afterEach);
        }
    };
}

async function sequence (promises) {
    await promises.reduce((acc, curr) => acc.then(curr), Promise.resolve());
}

module.exports = JobContainer;
