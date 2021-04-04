// fake console
function log () {
    return {
        debug: spy(),
        info: spy(),
        log: spy(),
        warn: spy(),
        error: spy()
    };
}

// wrapper function to track arguments
function spy (method = () => {}) {
    if (typeof method !== 'function') {
        throw new Error(`Spy must be a function got ${typeof method} instead.`);
    }

    function result (...params) {
        result.calls.push(params);
        return method(...params);
    }

    function reset () {
        result.calls = [];
    }

    result.reset = reset;
    result.calls = [];

    return result;
}

module.exports = { log, spy };
