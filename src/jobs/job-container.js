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

    async run () {
        global.kequtest.current = this;

        await super.run();

        if (this.error) return;

        try {
            await sequence(this.hooks.before);
            await sequence(this.buffer.map(job => this.buildJob(job).bind(this)));
            await sequence(this.hooks.after);
        } catch (error) {
            this.error = error;
            console.log('');
            console.error(error);
            console.log('');
        }
    }

    buildJob (job) {
        return async function () {
            await sequence(this.hooks.beforeEach);
            await job.run();
            await sequence(this.hooks.afterEach);
        };
    }
}

async function sequence (promises) {
    await promises.reduce((acc, curr) => acc.then(curr), Promise.resolve());
}

module.exports = JobContainer;
