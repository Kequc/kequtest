const mock = require('./mock.js');

function log () {
    return {
        debug: spy(),
        info: spy(),
        log: spy(),
        warn: spy(),
        error: spy()
    };
}

function spy (method = () => {}) {
    if (typeof method !== 'function') {
        throw new Error(`Spy must be a function got ${typeof method} instead.`);
    }

    function result (...params) {
        result.calls.push(params);
        return method(...params);
    }

    result.calls = [];

    return result;
}

module.exports = { mock, log, spy };
