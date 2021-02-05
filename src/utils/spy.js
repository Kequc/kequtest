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

module.exports = spy;
