import { Func } from '../types';

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

// fake console
export function logger (): SpyLogger {
    return {
        debug: spy(),
        info: spy(),
        log: spy(),
        warn: spy(),
        error: spy()
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
