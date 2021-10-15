import { Summary } from './src/env/summary';
import { Hooks } from './src/factory/container-job';
import { HookType } from './src/util/constants';

export type Suite = {
    run: () => Promise<void>;
};

export type AbstractJob = {
    run: (summary: Summary, logger: Logger) => Promise<void>;
    getParent: () => ContainerJob | undefined;
    getDescription: () => string;
};

export type ContainerJob = AbstractJob & {
    addContainer: (description: string, block?: AsyncFunc) => ContainerJob;
    addTest: (description: string, block?: AsyncFunc) => TestJob;
    addHook: (hookType: HookType, block: AsyncFunc) => void;
    addMock: (absolute: string) => void;
    addCache: (absolute: string) => void;
    getHooks: () => Hooks;
};

export type TestJob = AbstractJob & {
};

export type Logger = {
    log: Func;
    error: Func;
    warn: Func;
    debug: Func;
    info: Func;
};

export type Func = (...params: any[]) => any;
export type AsyncFunc = () => Promise<void> | void;
