import { Summary, SummaryFailure } from './env/summary';
import CreateSuite from './factory/suite';
import { CHARS } from './util/constants';
import findFilenames from './util/find-filenames';
import { pluralize, red } from './util/helpers';

import { Logger } from '../types';

// kequtest
async function main (summary: Summary, logger: Logger, absolutes: string[], exts: string[]): Promise<void> {
    const separator = '-'.repeat(process.stdout.columns);

    logger.info('STARTING');
    logger.debug(separator);
    logger.info('');

    for (const absolute of absolutes) {
        logger.info('> ' + absolute);
    }

    const filenames = findFilenames(logger, absolutes, exts);
    logger.info(`Found ${pluralize(filenames.length, 'test file')}...`);

    const suite = CreateSuite(summary, logger, filenames);
    await suite.run();

    for (const failure of summary.failures) {
        renderFailure(failure, logger);
    }

    logger.info('');
    logger.debug(separator);
    logger.info('FINISHED');
    logger.info(summary.info());
    logger.info('');
}

export default main;

function renderFailure (failure: SummaryFailure, logger: Logger) {
    logger.info('');
    logger.info(failureDescription(failure));

    if (failure.logs.length > 0) {
        logger.info('');
        for (const log of failure.logs) {
            logger[log.key](...log.params);
        }
    }

    logger.info('');
    logger.error(failure.error);
}

function failureDescription (failure: SummaryFailure): string {
    const parts = failure.tree.map(job => job.getDescription());
    return red('Failure: ') + parts.join(` ${CHARS.container} `);
}
