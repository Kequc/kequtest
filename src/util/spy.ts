import { Func } from '../types';

export type SpyLogger = {
    error: ISpyFunc,
    warn: ISpyFunc,
    info: ISpyFunc,
    http: ISpyFunc,
    verbose: ISpyFunc,
    debug: ISpyFunc,
    silly: ISpyFunc,
    log: ISpyFunc
};

export interface ISpyFunc {
    (...params: any[]): any;
    reset: () => void;
    calls: any[];
}

// fake console
export function logger (): SpyLogger {
    return {
        error: spy(),
        warn: spy(),
        info: spy(),
        http: spy(),
        verbose: spy(),
        debug: spy(),
        silly: spy(),
        log: spy()
    };
}

// wrapper function to track arguments
export function spy (method: Func = () => {}): ISpyFunc {
    if (typeof method !== 'function') {
        throw new Error(`Spy must be a function got ${typeof method} instead.`);
    }

    function result (...params: any[]) {
        result.calls.push(params);
        return method(...params);
    }

    function reset () {
        result.calls = [];
    }

    result.reset = reset;
    result.calls = [] as any[];

    return result;
}
