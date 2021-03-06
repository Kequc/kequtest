// abstract
class Job {
    constructor (description, block, depth) {
        if (typeof description !== 'string') {
            throw new Error(`Description must be a string got ${typeof description} instead.`);
        }
        if (block !== undefined && typeof block !== 'function') {
            throw new Error(`Block must be a function got ${typeof block} instead.`);
        }

        this.description = description;
        this.block = block;
        this.depth = depth;
        this.error = null;
    }

    // attempt to run client code
    async runClientCode (log) {
        try {
            if (this.block !== undefined) await this.block();
            log.info(this.message());
        } catch (error) {
            this.error = error;
            log.info(this.message());
            log.info('');
            log.error(error);
            log.info('');
        }
    }

    // basic output
    message () {
        const padding = this.description.length + (this.depth) * 2;
        return this.description.padStart(padding);
    }

    // default score
    getScore () {
        return {
            passed: 0,
            failed: 0,
            missing: 0,
            catastrophic: 0
        };
    }
}

module.exports = Job;
