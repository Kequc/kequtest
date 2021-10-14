import { HookType } from './src/helpers';

export type AbstractJob = {
    run: (log: Logger, parentHooks?: TreeHooks) => Promise<void>;
    getScore: () => Score;
};

export type ContainerJob = AbstractJob & {
    addFile: (filename: string) => TestJob;
    addContainer: (description: string, block?: AsyncFunc) => ContainerJob;
    addTest: (description: string, block?: AsyncFunc) => TestJob;
    addHook: (hookType: HookType, block: AsyncFunc) => void;
    addMock: (absolute: string) => void;
    addCache: (absolute: string) => void;
};

export type TestJob = AbstractJob & {
};

export type Administrative = {
    filename: string | null,
    container: ContainerJob | null
};

export type Logger = {
    log: Func;
    error: Func;
    warn: Func;
    debug: Func;
    info: Func;
};

export type SpyLogger = {
    log: ISpyFunc;
    error: ISpyFunc;
    warn: ISpyFunc;
    debug: ISpyFunc;
    info: ISpyFunc;
};

export interface ISpyFunc {
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

export interface IMock {
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
