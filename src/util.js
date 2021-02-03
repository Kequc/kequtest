function log () {
    return {
        info: spy(),
        log: spy(),
        warn: spy(),
        error: spy()
    };
}

function spy (method = () => {}) {
    function result (...params) {
        result.calls.push(params);
        return method(...params);
    }
    result.calls = [];
    return result;
}

module.exports = { log, spy };
