declare function describe(description: string, block: kequtest.Block): void;
declare function it(description: string, block: kequtest.Block): void;

declare function before(block: kequtest.Block): void;
declare function beforeEach(block: kequtest.Block): void;
declare function afterEach(block: kequtest.Block): void;
declare function after(block: kequtest.Block): void;

// eslint-disable-next-line no-var
declare var util: {
    mock: kequtest.Mock;
    uncache: (request: string) => void;
    log: () => kequtest.SpyLogger;
    spy: (method?: kequtest.Func) => kequtest.SpyFunc;
};

declare namespace kequtest {
    type Logger = {
        log: Func;
        error: Func;
        warn: Func;
        debug: Func;
        info: Func;
    };

    type SpyLogger = {
        log: SpyFunc;
        error: SpyFunc;
        warn: SpyFunc;
        debug: SpyFunc;
        info: SpyFunc;
    };

    type TreeHooks = {
        beforeEach: AsyncFunc[];
        afterEach: AsyncFunc[];
    };

    type Hooks = {
        before: AsyncFunc[];
        beforeEach: AsyncFunc[];
        afterEach: AsyncFunc[];
        after: AsyncFunc[];
    };

    interface SpyFunc {
        (...params: any[]): any;
        reset: () => void;
        calls: any[];
    }

    interface Mock {
        (request: string, override: any): void;
        stop: (mock: string) => void;
        stopAll: () => void;
    }

    type Score = {
        passed: number;
        failed: number;
        missing: number;
        catastrophic: number;
    };

    type Block = AsyncFunc | undefined;
    type Func = (...params: any[]) => any;
    type AsyncFunc = () => Promise<void> | void;
}
