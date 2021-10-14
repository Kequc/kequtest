import { BASE_SCORE, green, HookType, red, verifyBlock, verifyDescription } from '../helpers';
import { administrative } from '../main';

import { AsyncFunc, Logger, TestJob } from '../../types';

function CreateTestJob (description: string, block?: AsyncFunc): TestJob {
    if (block !== undefined) verifyBlock(block);
    verifyDescription(description);

    let _error: Error | null;

    // red x missing tag or green checkmark
    function postfix (): string {
        if (_error) return red(' \u2717');
        if (block === undefined) return green(' -- missing --');
        return green(' \u2713');
    }

    async function runClientCode (log: Logger) {
        const padding = description.length + (administrative.depth) * 2;
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
            for (const beforeEach of parentHooks?.[HookType.BEFORE_EACH] || []) await beforeEach(log);
            // block
            await runClientCode(log);
            // sequence
            for (const afterEach of parentHooks?.[HookType.AFTER_EACH] || []) await afterEach(log);
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
