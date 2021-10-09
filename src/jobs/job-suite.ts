import path from 'path';
import JobContainer from './job-container';
import { pluralise } from '../helpers';
import { administrative } from '../main';

import { Logger, TreeHooks } from '../../types';

// entrypoint
class JobSuite extends JobContainer {
    constructor (absolute: string, filenames: string[]) {
        const description = `Found ${pluralise(filenames.length, 'test file')}...`;
        const block = undefined;

        super(description, block, 0);

        // populate job buffer here
        this.buffer = filenames.map(filename => new JobFile(absolute, filename));
    }

    async run (log: Logger) {
        // prepare hooks
        const treeHooks = { beforeEach: [], afterEach : [] };

        await super.run(log, treeHooks);
    }
}

export default JobSuite;

class JobFile extends JobContainer {
    filename: string;

    constructor (absolute: string, filename: string) {
        const description = filename.replace(absolute + path.sep, '');
        const block = () => { require(filename); };

        super(description, block, 0);

        // track filename
        this.filename = filename;
    }

    async run (log: Logger, parentHooks: TreeHooks) {
        // track active filename
        administrative.filename = this.filename;

        await super.run(log, parentHooks);
    }
}
