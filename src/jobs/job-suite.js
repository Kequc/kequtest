const JobContainer = require('./job-container.js');
const { pluralise } = require('../util.js');

class JobSuite extends JobContainer {
    constructor (files) {
        const description = 'Cannot spell bugs without u';
        const cb = () => {};

        super(description, cb, 0);

        this.buffer = files.map(file => new JobFile(file));
    }

    message () {
        return `Found ${pluralise(this.buffer.length, 'test file')}...`;
    }
}

class JobFile extends JobContainer {
    constructor (file) {
        const description = file.split('/').pop();
        const cb = () => { require(file); };

        super(description, cb, 0);
    }
}

module.exports = JobSuite;
