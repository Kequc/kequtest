import { pluralize } from '../helpers';
import { administrative } from '../main';
import CreateContainerJob from './container-job';

import { ContainerJob, Logger } from '../../types';

function CreateSuiteJob (filenames: string[]): ContainerJob {
    const description = `Found ${pluralize(filenames.length, 'test file')}...`;
    const suite = CreateContainerJob(description);

    // populate job buffer here
    for (const filename of filenames) {
        suite.addJob(CreateFileJob(filename));
    }

    return suite;
}

export default CreateSuiteJob;

function CreateFileJob (filename: string): ContainerJob {
    const description = filename.replace(process.cwd(), '');

    const fileJob = CreateContainerJob(description, function block (log: Logger) {
        // add a spacer to log
        log.info('');
        // track active filename
        administrative.filename = filename;
        // load test file
        require(filename);
    });

    return fileJob;
}
