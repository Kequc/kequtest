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
