class Job {
    constructor (description, cb, depth) {
        this.description = description;
        this.cb = cb;
        this.depth = depth;
        this.error = null;
    }

    async run (log) {
        try {
            if (typeof this.cb === 'function') await this.cb();
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
