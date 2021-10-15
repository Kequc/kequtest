import { CHARS, HookType } from '../util/constants';
import { calcDepth } from '../util/helpers';
import { verifyBlock, verifyDescription } from '../util/verify';
import CreateTestJob from './test-job';

import { AsyncFunc, ContainerJob, TestJob } from '../../types';

export type TreeHooks = {
    [HookType.BEFORE_EACH]: AsyncFunc[];
    [HookType.AFTER_EACH]: AsyncFunc[];
};

export type Hooks = TreeHooks & {
    [HookType.BEFORE]: AsyncFunc[];
    [HookType.AFTER]: AsyncFunc[];
};

function CreateContainerJob (description: string, block?: AsyncFunc, parent?: ContainerJob): ContainerJob {
    if (block !== undefined) verifyBlock(block);
    verifyDescription(description);

    const hooks: Hooks = {
        [HookType.BEFORE]: [],
        [HookType.BEFORE_EACH]: [],
        [HookType.AFTER_EACH]: [],
        [HookType.AFTER]: []
    };
    const buffer: (ContainerJob | TestJob)[] = [];
    const mocks: string[] = [];
    const caches: string[] = [];

    function message (): string {
        const depth = calcDepth(parent);
        const padding = description.length + (depth * 2);
        const result = description.padStart(padding);

        if (depth > 0) return result + ' ' + CHARS.container;
        return result;
    }

    function cleanup () {
        for (const mock of mocks) {
            global.util.mock.stop(mock);
        }
        for (const cache of caches) {
            global.util.uncache(cache);
        }
    }

    return {
        addContainer (description, block) {
            const result = CreateContainerJob(description, block, this);
            buffer.push(result);
            return result;
        },
        addTest (description, block) {
            const result = CreateTestJob(description, block, this);
            buffer.push(result);
            return result;
        },
        addHook (hookType, block) {
            verifyBlock(block);
            hooks[hookType].push(block);
        },
        addMock (absolute) {
            mocks.push(absolute);
        },
        addCache (absolute) {
            caches.push(absolute);
        },
        getParent () {
            return parent;
        },
        getDescription () {
            return description;
        },
        getHooks () {
            return hooks;
        },
        async run (summary, logger) {
            // track active container
            summary.container = this;
            // client console
            summary.clearConsole();

            logger.info(message());

            if (block === undefined) return;

            try {
                // initialize
                await block();
                // sequence
                for (const before of hooks[HookType.BEFORE]) await before();
                // sequence
                for (const job of buffer) await job.run(summary, logger);
                // sequence
                for (const after of hooks[HookType.AFTER]) await after();
            } catch (error) {
                // container threw error
                summary.addFailure(this, error as Error);
            }

            cleanup();
        }
    };
}

export default CreateContainerJob;
