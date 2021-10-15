import { BASE_SCORE, CHARS, HookType } from '../constants';
import { green, red, renderError, verifyBlock, verifyDescription } from '../helpers';

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

    function message (): string {
        const padding = description.length + (depth * 2);
        return ('\u00B7 ' + description).padStart(padding) + postfix();
    }

    async function runClientCode (log: Logger) {
        try {
            if (block !== undefined) await block(log);
        } catch (error) {
            // test threw error
            _error = error as Error;
        }

        log.info(message());
        renderError(log, _error);
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
