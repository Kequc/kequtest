import { pluralize } from '../helpers';
import CreateContainerJob from './container-job';

import { ContainerJob } from '../../types';

function CreateSuiteJob (filenames: string[]): ContainerJob {
    const description = `Found ${pluralize(filenames.length, 'test file')}...`;
    const suite = CreateContainerJob(description);

    // populate job buffer here
    for (const filename of filenames) {
        suite.addFile(filename);
    }

    return suite;
}

export default CreateSuiteJob;
