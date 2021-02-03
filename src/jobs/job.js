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
        return prefix(this.depth) + this.description;
    }
}

function prefix (depth) {
    let result = '';

    for (let i = 0; i < depth; i++) {
        result += (i === depth - 1 ? '\u00B7 ' : '  ');
    }

    return result;
}

module.exports = Job;
