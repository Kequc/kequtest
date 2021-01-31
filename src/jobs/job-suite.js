const JobContainer = require('./job-container.js');
const { pluralise } = require('../util.js');

function NOOP () {}

class JobSuite extends JobContainer {
    constructor (files) {
        super('', NOOP, -1);

        this.buffer = files.map(file => new JobFile(file));
    }

    message () {
        return `Found ${pluralise(this.buffer.length, 'test file')}...`;
    }
}

class JobFile extends JobContainer {
    constructor (file) {
        super(file.split('/').pop(), () => { require(file); }, 0);
    }
}

module.exports = JobSuite;
