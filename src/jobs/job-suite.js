const path = require('path');
const JobContainer = require('./job-container.js');
const { pluralise } = require('../helpers.js');

// entrypoint
class JobSuite extends JobContainer {
    constructor (absolute, filenames) {
        const description = `Found ${pluralise(filenames.length, 'test file')}...`;
        const block = undefined;

        super(description, block, 0);

        // populate job buffer here
        this.buffer = filenames.map(filename => new JobFile(absolute, filename));
    }

    async run (log) {
        // prepare hooks
        const treeHooks = { beforeEach: [], afterEach : [] };

        await super.run(log, treeHooks);
    }
}

module.exports = JobSuite;

class JobFile extends JobContainer {
    constructor (absolute, filename) {
        const description = filename.replace(absolute + path.sep, '');
        const block = () => { require(filename); };

        super(description, block, 0);

        // track filename
        this.filename = filename;
    }

    async run (...params) {
        // track active filename
        global.kequtest.filename = this.filename;

        await super.run(...params);
    }
}
