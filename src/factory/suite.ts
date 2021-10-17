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
            // take over console
            const originalConsole = global.console;
            global.console = summary.getFakeConsole();

            // sequence
            for (const filename of filenames) await openFile(filename);

            // restore console
            global.console = originalConsole;
        }
    };
}

export default CreateSuite;
