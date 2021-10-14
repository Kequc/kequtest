import { BASE_SCORE, CHARS, HookType, verifyBlock, verifyDescription } from '../helpers';
import { administrative } from '../main';
import CreateTestJob from './test-job';

import { AsyncFunc, ContainerJob, Hooks, Logger, TestJob, TreeHooks } from '../../types';

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

    let _error: Error | null;

    async function runClientCode (log: Logger) {
        const padding = description.length + (depth * 2);
        let message = description.padStart(padding);

        if (depth > 0)
            message += ' ' + CHARS.container;

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
        addFile (filename) {
            const description = filename.replace(process.cwd(), '');
            const result = CreateContainerJob(description, (log) => {
                log.info('');
                administrative.filename = filename;
                require(filename);
            });
            _buffer.push(result);
            return result;
        },
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
