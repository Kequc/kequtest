import { BASE_SCORE, HookType, verifyBlock, verifyDescription } from '../helpers';
import { administrative } from '../main';

import { AsyncFunc, ContainerJob, Hooks, Logger, TestJob, TreeHooks } from '../../types';

function CreateContainerJob (description: string, block?: AsyncFunc): ContainerJob {
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

    let _error: Error | null;

    async function runClientCode (log: Logger) {
        const padding = description.length + (administrative.depth * 2);
        const message = description.padStart(padding);

        try {
            if (block !== undefined) await block(log);
            log.info(message);
        } catch (error) {
            _error = error as Error;
            log.info(message);
            log.info('');
            log.error(error);
            log.info('');
        }
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
        addHook (hookType, block) {
            verifyBlock(block);
            _hooks[hookType].push(block);
        },
        addJob (job) {
            _buffer.push(job);
        },
        addMock (absolute) {
            _mocks.push(absolute);
        },
        addCache (absolute) {
            _caches.push(absolute);
        },
        async run (log, parentHooks) {
            // track active container
            administrative.container = this;

            // initialize
            await runClientCode(log);
        
            if (_error) {
                // initialization threw catastrophic error
                cleanup();
                return;
            }

            // include hooks from ancestors
            const treeHooks = getTreeHooks(parentHooks);

            // increase loger depth
            administrative.depth++;

            try {
                // sequence
                for (const before of _hooks[HookType.BEFORE]) await before(log);
                // sequence
                for (const job of _buffer) await job.run(log, treeHooks);
                // sequence
                for (const after of _hooks[HookType.AFTER]) await after(log);
            } catch (error) {
                // hook threw catastrophic error
                _error = error as Error;
                log.info('');
                log.error(error);
                log.info('');
            }

            // reduce logger depth
            administrative.depth--;

            cleanup();
        },
        getScore () {
            const result = Object.assign({}, BASE_SCORE);

            if (_error) {
                result.catastrophic++;
                return result;
            }
    
            for (const job of _buffer) {
                for (const [key, value] of Object.entries(job.getScore())) {
                    result[key] += value;
                }
            }
    
            return result;
        }
    };
}

export default CreateContainerJob;
