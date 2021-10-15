import { Summary } from '../env/summary';
import CreateContainerJob from './container-job';

import { Logger, Suite } from '../../types';

function CreateSuite (summary: Summary, logger: Logger, filenames: string[]): Suite {
    async function openFile (filename: string) {
        const description = filename.replace(process.cwd(), '');
        const file = CreateContainerJob(description, () => {
            require(filename);
        });
    
        // track active file
        summary.filename = filename;
        logger.info('');
    
        await file.run(summary, logger);
    }

    return {
        async run () {
            // sequence
            for (const filename of filenames) await openFile(filename);
        }
    };
}

export default CreateSuite;
