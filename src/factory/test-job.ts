import { BASE_SCORE, CHARS, green, HookType, red, verifyBlock, verifyDescription } from '../helpers';

import { AsyncFunc, Logger, TestJob } from '../../types';

function CreateTestJob (description: string, block?: AsyncFunc, depth = 0): TestJob {
    if (block !== undefined) verifyBlock(block);
    verifyDescription(description);

    let _error: Error | null;

    // red x missing tag or green checkmark
    function postfix (): string {
        if (_error) return red(' ' + CHARS.fail);
        if (block === undefined) return green(' -- missing --');
        return green(' ' + CHARS.success);
    }

    async function runClientCode (log: Logger) {
        const padding = description.length + (depth * 2);
        const message = ('\u00B7 ' + description).padStart(padding);

        try {
            if (block !== undefined) await block(log);
            log.info(message + postfix());
        } catch (error) {
            // test threw error
            _error = error as Error;
            log.info(message + postfix());
            log.info('');
            log.error(error);
            log.info('');
        }
    }

    return {
        async run (log, parentHooks) {
            // sequence
            if (parentHooks)
                for (const beforeEach of parentHooks[HookType.BEFORE_EACH]) await beforeEach(log);
            // block
            await runClientCode(log);
            // sequence
            if (parentHooks)
                for (const afterEach of parentHooks[HookType.AFTER_EACH]) await afterEach(log);
        },
        getScore () {
            const result = Object.assign({}, BASE_SCORE);

            if (_error) {
                result.failed++;
            } else if (block === undefined) {
                result.missing++;
            } else {
                result.passed++;
            }
    
            return result;
        }
    };
}

export default CreateTestJob;
