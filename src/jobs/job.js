class Job {
    constructor (description, cb, depth) {
        this.description = description;
        this.cb = cb;
        this.depth = depth;
        this.error = null;
    }

    async run (log) {
        try {
            await this.cb();
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
        return this.description.padStart(this.description.length + (this.depth * 2));
    }
}

module.exports = Job;
