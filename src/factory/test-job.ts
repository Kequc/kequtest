import { Summary } from '../env/summary';
import { CHARS, HookType } from '../util/constants';
import { calcDepth, green, red } from '../util/helpers';
import { verifyBlock, verifyDescription } from '../util/verify';
import { TreeHooks } from './container-job';

import { AsyncFunc, ContainerJob, TestJob } from '../../types';

function CreateTestJob (description: string, block?: AsyncFunc, parent?: ContainerJob): TestJob {
    if (block !== undefined) verifyBlock(block);
    verifyDescription(description);

    function message (): string {
        const depth = calcDepth(parent);
        const padding = description.length + (depth * 2);
        return ('\u00B7 ' + description).padStart(padding);
    }

    const test: TestJob = {
        async run (summary, logger) {
            // client console
            summary.clearConsole();
            // combine hooks
            const treeHooks = getTreeHooks(parent);
            // sequence
            for (const beforeEach of treeHooks[HookType.BEFORE_EACH]) await beforeEach();
            // client code
            const suffix = await runClientCode(summary);
            // print
            logger.log(message() + ' ' + suffix);
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

    async function runClientCode (summary: Summary): Promise<string> {
        try {
            if (block !== undefined) {
                await block();
                summary.successCount++;
                return green(CHARS.success);
            } else {
                summary.missingCount++;
                return green('-- missing --');
            }
        } catch (error) {
            // test throws an error
            summary.addFailure(test, error as Error);
            return red(CHARS.fail);
        }
    }

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
        result[HookType.BEFORE_EACH] = [...result[HookType.AFTER_EACH], ...parent[HookType.AFTER_EACH]];
        container = container.getParent();
    }

    return result;
}
