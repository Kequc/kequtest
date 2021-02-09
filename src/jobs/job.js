class Job {
    constructor (description, cb, depth) {
        if (typeof description !== 'string') {
            throw new Error(`Description must be a string got ${typeof description} instead.`);
        }
        if (cb !== undefined && typeof cb !== 'function') {
            throw new Error(`Block must be a function got ${typeof cb} instead.`);
        }

        this.description = description;
        this.cb = cb;
        this.depth = depth;
        this.error = null;
    }

    async run (log) {
        try {
            if (this.cb !== undefined) await this.cb();
            log.info(this.message());
        } catch (error) {
            this.error = error;
            log.info(this.message());
            log.info('');
            log.error(error);
            log.info('');
        }
    }

    message () {
        const padding = (this.depth) * 2;
        return this.description.padStart(this.description.length + padding);
    }
}

module.exports = Job;
