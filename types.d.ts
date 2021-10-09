declare global {
    function describe(description: string, block: Block): void;
    function it(description: string, block: Block): void;

    function before(block: Block): void;
    function beforeEach(block: Block): void;
    function afterEach(block: Block): void;
    function after(block: Block): void;

    var util: {
        mock: Mock;
        uncache: (request: string) => void;
        log: () => {
            log: SpyFunc;
            error: SpyFunc;
            warn: SpyFunc;
            debug: SpyFunc;
            info: SpyFunc;
        };
        spy: (method?: Func) => SpyFunc;
    };
}

export type Logger = {
    log: Func;
    error: Func;
    warn: Func;
    debug: Func;
    info: Func;
};

export type TreeHooks = {
    beforeEach: HookCollection;
    afterEach: HookCollection;
};

export type Hooks = {
    before: HookCollection;
    beforeEach: HookCollection;
    afterEach: HookCollection;
    after: HookCollection;
};

export interface SpyFunc {
    (...params: any): any;
    reset: () => void;
    calls: any[];
}

export interface Mock {
    (request: string, override: any): void;
    stop: (mock: string) => void;
    stopAll: () => void;
}

export type Block = AsyncFunc | undefined;
export type Func = (...params: any) => any;
export type HookCollection = AsyncFunc[];
export type AsyncFunc = () => Promise<void> | void;
