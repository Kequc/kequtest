const path = require('path');
const JobContainer = require('./job-container.js');
const { pluralise } = require('../helpers.js');

class JobSuite extends JobContainer {
    constructor (absolute, filenames) {
        const description = `Found ${pluralise(filenames.length, 'test file')}...`;

        super(description, undefined, 0);

        this.buffer = filenames.map(filename => new JobFile(absolute, filename));
    }

    async run (log) {
        await super.run(log, { beforeEach: [], afterEach : [] });
    }
}

class JobFile extends JobContainer {
    constructor (absolute, filename) {
        const description = filename.replace(absolute + path.sep, '');

        super(description, () => { require(filename); }, 0);

        this.filename = filename;
    }

    async run (...params) {
        global.kequtest.filename = this.filename;

        await super.run(...params);
    }
}

module.exports = JobSuite;
