import { pluralize } from '../util/helpers';
import CreateContainerJob from './container-job';
import { Summary } from '../env/summary';

import { ContainerJob, Logger } from '../../types';

function CreateSuiteJob (summary: Summary, logger: Logger, filenames: string[]): ContainerJob {
    const description = `Found ${pluralize(filenames.length, 'test file')}...`;
    const suite = CreateContainerJob(description);

    // populate job buffer
    for (const filename of filenames) {
        const description = filename.replace(process.cwd(), '');
        suite.addContainer(description, function () {
            // open test file
            logger.info('');
            summary.filename = filename;
            require(filename);
        });
    }

    return suite;
}

export default CreateSuiteJob;
