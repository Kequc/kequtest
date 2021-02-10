const Module = require('module');
const path = require('path');

const _load = Module._load;
const overrides = {};

Module._load = function (request, parent) {
    if (parent) {
        const absolute = calcAbsolute(request, parent.filename);
        if (overrides[absolute]) {
            return overrides[absolute];
        }
    }

    return _load.apply(this, arguments);
};

function mock (request, override) {
    const { filename, container } = global.kequtest;
    const absolute = calcAbsolute(request, filename);
    container.mocks.push(absolute);
    overrides[absolute] = override;
}

function stop (request) {
    const { filename } = global.kequtest;
    const absolute = calcAbsolute(request, filename);
    delete overrides[absolute];
}

function stopAll () {
    for (const absolute of Object.keys(overrides)) {
        delete overrides[absolute];
    }
}

function uncache (request) {
    const { filename } = global.kequtest;
    const absolute = calcAbsolute(request, filename);
    delete require.cache[absolute];
}

mock.stop = stop;
mock.stopAll = stopAll;

module.exports = { mock, uncache };

// Convert a request into an absolute path
function calcAbsolute (request, parentFilename) {
    if (typeof request !== 'string') {
        throw new Error(`Request must be a string got ${typeof request} instead.`);
    }
    if (/^\.{1,2}[/\\]?/.test(request)) {
        return path.join(path.dirname(parentFilename), request);
    }
    return request;
}
