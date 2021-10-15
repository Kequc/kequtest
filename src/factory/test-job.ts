import { CHARS, HookType } from '../util/constants';
import { calcDepth, green, red } from '../util/helpers';
import { verifyBlock, verifyDescription } from '../util/verify';
import { TreeHooks } from './container-job';

import { AsyncFunc, ContainerJob, TestJob } from '../../types';

function CreateTestJob (description: string, block?: AsyncFunc, parent?: ContainerJob): TestJob {
    if (block !== undefined) verifyBlock(block);
    verifyDescription(description);

    let failed = false;

    // red x missing tag or green checkmark
    function postfix (): string {
        if (failed) return red(' ' + CHARS.fail);
        if (block === undefined) return green(' -- missing --');
        return green(' ' + CHARS.success);
    }

    function message (): string {
        const depth = calcDepth(parent);
        const padding = description.length + (depth * 2);
        return ('\u00B7 ' + description).padStart(padding) + postfix();
    }

    return {
        async run (summary, logger) {
            // client console
            summary.clearConsole();

            // combine hooks
            const treeHooks = getTreeHooks(parent);

            // sequence
            for (const beforeEach of treeHooks[HookType.BEFORE_EACH]) await beforeEach();

            // client code
            if (block !== undefined) {
                try {
                    await block();
                    summary.successCount++;
                } catch (error) {
                    // test threw error
                    failed = true;
                    summary.addFailure(this, error as Error);
                }
            } else {
                summary.missingCount++;
            }

            logger.info(message());

            // sequence
            for (const afterEach of treeHooks[HookType.AFTER_EACH]) await afterEach();
        },
        getParent () {
            return parent;
        },
        getDescription () {
            return description;
        }
    };
}

export default CreateTestJob;

function getTreeHooks (container?: ContainerJob) {
    const result: TreeHooks = {
        [HookType.BEFORE_EACH]: [],
        [HookType.AFTER_EACH]: []
    };

    while (container) {
        const parent = container.getHooks();
        result[HookType.BEFORE_EACH] = [...parent[HookType.BEFORE_EACH], ...result[HookType.BEFORE_EACH]];
        result[HookType.BEFORE_EACH] = [...result[HookType.AFTER_EACH], ...parent[HookType.AFTER_EACH]];
        container = container.getParent();
    }

    return result;
}
