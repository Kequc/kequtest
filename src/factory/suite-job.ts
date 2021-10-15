import { Summary } from '../env/summary';
import CreateContainerJob from './container-job';

import { Logger, SuiteJob } from '../../types';

function CreateSuiteJob (summary: Summary, logger: Logger, filenames: string[]): SuiteJob {
    async function openFile (filename: string) {
        const description = filename.replace(process.cwd(), '');
        const file = CreateContainerJob(description, () => {
            require(filename);
        });
    
        // track active file
        summary.filename = filename;
        logger.info('');
    
        try {
            await file.run(summary, logger);
        } catch (error) {
            // file thows an error
            summary.addFailure(file, error as Error);
        }
    }

    return {
        async run () {
            // sequence
            for (const filename of filenames) await openFile(filename);
        }
    };
}

export default CreateSuiteJob;
