const Module = require('module');
const path = require('path');

const _load = Module._load;
const overrides = {};

Module._load = function (request, parent) {
    const { container } = global.kequtest;
    const absolute = calcAbsolute(request, parent.filename);

    // check if we're overriding it
    if (parent && overrides[absolute]) {
        return overrides[absolute];
    }

    // node will cache the requested resource
    if (container && !require.cache[absolute]) {
        container.caches.push(absolute);
    }

    // hand over to node
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

// request to absolute path
function calcAbsolute (request, filename) {
    if (typeof request !== 'string') {
        throw new Error(`Target must be a string got ${typeof request} instead.`);
    }
    if (/^\.{1,2}[/\\]?/.test(request)) {
        const absolute = path.join(path.dirname(filename), request);
        return require.resolve(absolute);
    }
    return require.resolve(request);
}
