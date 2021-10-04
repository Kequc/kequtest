import { Logger } from '../../types/main';

// fake console
export function log (): Logger {
    return {
        debug: spy(),
        info: spy(),
        log: spy(),
        warn: spy(),
        error: spy()
    };
}

// wrapper function to track arguments
export function spy (method: (...params: any) => any = () => {}) {
    if (typeof method !== 'function') {
        throw new Error(`Spy must be a function got ${typeof method} instead.`);
    }

    function result (...params: any) {
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
