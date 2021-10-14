import { HookType } from './src/helpers';

export type AbstractJob = {
    run: (log: Logger, parentHooks?: TreeHooks) => Promise<void>;
    getScore: () => Score;
};

export type ContainerJob = AbstractJob & {
    addHook: (hookType: HookType, block: AsyncFunc) => void;
    addJob: (job: ContainerJob | TestJob) => void;
    addMock: (absolute: string) => void;
    addCache: (absolute: string) => void;
};

export type TestJob = AbstractJob & {
};

export type Administrative = {
    filename: string | null,
    container: ContainerJob | null
    depth: number;
};

export type Logger = {
    log: Func;
    error: Func;
    warn: Func;
    debug: Func;
    info: Func;
};

export type SpyLogger = {
    log: SpyFunc;
    error: SpyFunc;
    warn: SpyFunc;
    debug: SpyFunc;
    info: SpyFunc;
};

export interface SpyFunc {
    (...params: any[]): any;
    reset: () => void;
    calls: any[];
}

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

export interface Mock {
    (request: string, override: any): void;
    stop: (mock: string) => void;
    stopAll: () => void;
}

export type Score = {
    passed: number;
    failed: number;
    missing: number;
    catastrophic: number;
};

export type Func = (...params: any[]) => any;
export type AsyncFunc = (log: Logger) => Promise<void> | void;
