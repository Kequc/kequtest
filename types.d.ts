declare global {
    function describe(description: string, block: Block): void;
    function it(description: string, block: Block): void;

    function before(block: Block): void;
    function beforeEach(block: Block): void;
    function afterEach(block: Block): void;
    function after(block: Block): void;

    // eslint-disable-next-line no-var
    var util: {
        mock: Mock;
        uncache: (request: string) => void;
        log: () => SpyLogger;
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

export type SpyLogger = {
    log: SpyFunc;
    error: SpyFunc;
    warn: SpyFunc;
    debug: SpyFunc;
    info: SpyFunc;
};

export type TreeHooks = {
    beforeEach: AsyncFunc[];
    afterEach: AsyncFunc[];
};

export type Hooks = {
    before: AsyncFunc[];
    beforeEach: AsyncFunc[];
    afterEach: AsyncFunc[];
    after: AsyncFunc[];
};

export interface SpyFunc {
    (...params: any[]): any;
    reset: () => void;
    calls: any[];
}

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

export type Block = AsyncFunc | undefined;
export type Func = (...params: any[]) => any;
export type AsyncFunc = () => Promise<void> | void;
