const Module = require('module');

const _load = Module._load;
const overrides = {};

Module._load = function (request) {
    if (overrides[request]) {
        return overrides[request];
    }

    return _load.apply(this, arguments);
};

function mock (request, override) {
    const container = global.kequtest.container;
    container.mocks.push(request);
    overrides[request] = override;
}

function stop (request) {
    delete overrides[request];
}

function stopAll () {
    for (const request of Object.keys(overrides)) {
        delete overrides[request];
    }
}

mock.stop = stop;
mock.stopAll = stopAll;

module.exports = mock;
