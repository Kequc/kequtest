class Job {
    constructor (description, cb, depth) {
        this.description = description;
        this.cb = cb;
        this.depth = depth;
        this.error = null;
    }

    async run () {
        try {
            await this.cb();
            console.log(this.message());
        } catch (error) {
            this.error = error;
            console.log(this.message());
            console.log('');
            console.error(error);
            console.log('');
        }
    }

    message () {
        let prefix = '';
        for (let i = 0; i < this.depth; i++) {
            prefix += (i === this.depth - 1 ? '\u00B7 ' : '  ');
        }
        return prefix + this.description;
    }
}

module.exports = Job;
