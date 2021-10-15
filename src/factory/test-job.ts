import { CHARS, HookType } from '../util/constants';
import { green, red } from '../util/helpers';

import { AsyncFunc, TestJob } from '../../types';
import { verifyBlock, verifyDescription } from '../util/verify';

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

    return {
        async run (summary, logger, parentHooks) {
            // client console
            summary.clearConsole();

            // sequence
            if (parentHooks)
                for (const beforeEach of parentHooks[HookType.BEFORE_EACH]) await beforeEach();

            // client code
            if (block !== undefined) {
                try {
                    await block();
                    summary.successCount++;
                } catch (error) {
                    // test threw error
                    _error = error as Error;
                    summary.addFailure(description, _error);
                }
            } else {
                summary.missingCount++;
            }

            logger.info(message());

            // sequence
            if (parentHooks)
                for (const afterEach of parentHooks[HookType.AFTER_EACH]) await afterEach();
        }
    };
}

export default CreateTestJob;
