import { CHARS, HookType } from '../util/constants';
import { verifyBlock, verifyDescription } from '../util/verify';
import CreateTestJob from './test-job';

import { AsyncFunc, ContainerJob, TestJob } from '../../types';

export type TreeHooks = {
    [HookType.BEFORE_EACH]: AsyncFunc[];
    [HookType.AFTER_EACH]: AsyncFunc[];
};

export type Hooks = {
    [HookType.BEFORE]: AsyncFunc[];
    [HookType.BEFORE_EACH]: AsyncFunc[];
    [HookType.AFTER_EACH]: AsyncFunc[];
    [HookType.AFTER]: AsyncFunc[];
};

function CreateContainerJob (description: string, block?: AsyncFunc, depth = 0): ContainerJob {
    if (block !== undefined) verifyBlock(block);
    verifyDescription(description);

    const _hooks: Hooks = {
        [HookType.BEFORE]: [],
        [HookType.BEFORE_EACH]: [],
        [HookType.AFTER_EACH]: [],
        [HookType.AFTER]: []
    };
    const _buffer: (ContainerJob | TestJob)[] = [];
    const _mocks: string[] = [];
    const _caches: string[] = [];

    function message (): string {
        const padding = description.length + (depth * 2);
        const result = description.padStart(padding);

        if (depth > 0) return result + ' ' + CHARS.container;
        return result;
    }

    // combine hooks
    function getTreeHooks (parentHooks?: TreeHooks): TreeHooks {
        if (parentHooks) {
            return {
                [HookType.BEFORE_EACH]: parentHooks[HookType.BEFORE_EACH].concat(_hooks[HookType.BEFORE_EACH]),
                [HookType.AFTER_EACH]: _hooks[HookType.AFTER_EACH].concat(parentHooks[HookType.AFTER_EACH])
            };
        }
        return {
            [HookType.BEFORE_EACH]: _hooks[HookType.BEFORE_EACH],
            [HookType.AFTER_EACH]: _hooks[HookType.AFTER_EACH]
        };
    }

    function cleanup () {
        for (const mock of _mocks) {
            global.util.mock.stop(mock);
        }
        for (const cache of _caches) {
            global.util.uncache(cache);
        }
    }

    return {
        addContainer (description, block) {
            const result = CreateContainerJob(description, block, depth + 1);
            _buffer.push(result);
            return result;
        },
        addTest (description, block) {
            const result = CreateTestJob(description, block, depth + 1);
            _buffer.push(result);
            return result;
        },
        addHook (hookType, block) {
            verifyBlock(block);
            _hooks[hookType].push(block);
        },
        addMock (absolute) {
            _mocks.push(absolute);
        },
        addCache (absolute) {
            _caches.push(absolute);
        },
        async run (summary, logger, parentHooks) {
            // track active container
            summary.container = this;
            // client console
            summary.clearConsole();
            // include hooks from ancestors
            const treeHooks = getTreeHooks(parentHooks);

            logger.info(message());

            if (block === undefined) return;

            try {
                // initialize
                await block();
                // sequence
                for (const before of _hooks[HookType.BEFORE]) await before();
                // sequence
                for (const job of _buffer) await job.run(summary, logger, treeHooks);
                // sequence
                for (const after of _hooks[HookType.AFTER]) await after();
            } catch (error) {
                // container threw error
                summary.addFailure(description, error as Error);
            }

            cleanup();
        }
    };
}

export default CreateContainerJob;
