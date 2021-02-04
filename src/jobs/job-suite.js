const JobContainer = require('./job-container.js');
const { pluralise } = require('../helpers.js');

class JobSuite extends JobContainer {
    constructor (directory, files) {
        const description = `Found ${pluralise(files.length, 'test file')}...`;
        const cb = () => {};

        super(description, cb, 0);

        this.buffer = files.map(file => new JobFile(directory, file));
    }

    async run (log) {
        await super.run(log, { beforeEach: [], afterEach : [] });
    }
}

class JobFile extends JobContainer {
    constructor (directory, file) {
        const description = file.replace(directory + '/', '');
        const cb = () => { require(file); };

        super(description, cb, 0);
    }
}

module.exports = JobSuite;
