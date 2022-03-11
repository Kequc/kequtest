import { TreeHooks } from './container-job';
import { AsyncFunc, ContainerJob, TestJob } from '../types';
import { BLOCK_TIMEOUT, CHARS, HookType } from '../util/constants';
import {
    calcDepth,
    green,
    red,
    withTimeout
} from '../util/helpers';
import { verifyBlock, verifyDescription } from '../util/verify';

function CreateTestJob (description: string, block?: AsyncFunc, parent?: ContainerJob): TestJob {
    if (block !== undefined) verifyBlock(block);
    verifyDescription(description);

    function message (): string {
        const depth = calcDepth(parent);
        const padding = description.length + (depth * 2);
        return (CHARS.test + ' ' + description).padStart(padding);
    }

    const test: TestJob = {
        async run (summary, logger) {
            // combine hooks
            const treeHooks = getTreeHooks(parent);

            await summary.captureConsole(async function ({ getLogs }) {
                let suffix: string;

                try {
                    // sequence
                    for (const beforeEach of treeHooks[HookType.BEFORE_EACH]) await withTimeout(beforeEach(), BLOCK_TIMEOUT);
                    // client code
                    if (block !== undefined) {
                        await withTimeout(block(), BLOCK_TIMEOUT);
                        summary.successCount++;
                        suffix = green(CHARS.success);
                    } else {
                        summary.missingCount++;
                        suffix = green('-- missing --');
                    }
                    // sequence
                    for (const afterEach of treeHooks[HookType.AFTER_EACH]) await withTimeout(afterEach(), BLOCK_TIMEOUT);
                } catch (error) {
                    // test throws an error
                    summary.failCount++;
                    summary.addFailure(test, getLogs(), error as Error);
                    suffix = red(CHARS.fail);
                }

                // print
                logger.info(message() + ' ' + suffix);
            });
        },
        getParent () {
            return parent;
        },
        getDescription () {
            return description;
        }
    };

    return test;
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
        result[HookType.AFTER_EACH] = [...result[HookType.AFTER_EACH], ...parent[HookType.AFTER_EACH]];
        container = container.getParent();
    }

    return result;
}
