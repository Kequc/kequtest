const Job = require('./job.js');

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
    }

    async run (log, parentHooks) {
        global.kequtest.current = this;

        await super.run(log);

        if (this.error) {
            this.buffer = [];
            return;
        }

        // Looking at all the hooks up the tree
        const hooks = {
            beforeEach: parentHooks.beforeEach.concat(this.hooks.beforeEach),
            afterEach: this.hooks.afterEach.concat(parentHooks.afterEach)
        };

        try {
            await sequence(this.hooks.before);
            await sequence(this.buffer.map(job => buildJob(job, log, hooks)));
            await sequence(this.hooks.after);
        } catch (error) {
            this.error = error;
            log.info('');
            log.error(error);
            log.info('');
        }
    }
}

function buildJob (job, log, hooks) {
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
