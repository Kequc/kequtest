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
    const absolute = calcAbsolute(request, callerFilename());
    const container = global.kequtest.container;
    container.mocks.push(absolute);
    overrides[absolute] = override;
}

function stop (request) {
    const absolute = calcAbsolute(request, callerFilename());
    delete overrides[absolute];
}

function stopAll () {
    for (const absolute of Object.keys(overrides)) {
        delete overrides[absolute];
    }
}

function uncache (request) {
    const absolute = calcAbsolute(request, callerFilename());
    delete require.cache[absolute];
}

mock.stop = stop;
mock.stopAll = stopAll;

module.exports = { mock, uncache };

// Convert a request into an absolute path
function calcAbsolute (request, parentFilename) {
    if (/^\.{1,2}[/\\]?/.test(request)) {
        return path.join(path.dirname(parentFilename), request);
    }
    return request;
}

// Inspects the stack looking for caller of this method
function callerFilename () {
    const line = new Error().stack.split('\n')[3];
    return line.slice(line.lastIndexOf('(') + 1, line.lastIndexOf(')'));
}
