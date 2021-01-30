class Job {
    constructor (description, cb, depth) {
        this.description = description;
        this.cb = cb;
        this.depth = depth;

        this.error = null;
        this.buffer = [];
    }

    async run () {
        this.beforeStart();

        try {
            await this.cb();
        } catch (error) {
            this.error = error;
        }

        this.print();

        // Run in sequence
        await this.buffer.reduce((acc, curr) => acc.then(curr.run.bind(curr)), Promise.resolve());
    }

    beforeStart () {
    }

    print () {
        console.log(this.message());

        if (this.error) {
            console.log('');
            console.error(this.error);
            console.log('');
        }
    }

    message () {
        let prefix = '';
        for (let i = 0; i < this.depth; i++) {
            prefix += (i === this.depth - 1 ? ' \u00B7 ' : '   ');
        }
        return prefix + this.description;
    }
}

module.exports = Job;
