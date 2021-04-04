const Module = require('module');
const path = require('path');

const _load = Module._load;
const overrides = {};

// overridden node internal
Module._load = function (request, parent) {
    if (parent) {
        const { container } = global.kequtest;
        const absolute = calcAbsolute(request, parent.filename);

        // if we're mocking this request
        if (overrides[absolute]) {
            return overrides[absolute];
        }

        // node will cache the requested resource
        // we track it so that it can be uncached later
        if (container && !require.cache[absolute]) {
            container.caches.push(absolute);
        }
    }

    // hand over to node
    return _load.apply(this, arguments);
};

// track specified overload
function mock (request, override) {
    const { filename, container } = global.kequtest;
    const absolute = calcAbsolute(request, filename);
    container.mocks.push(absolute);
    overrides[absolute] = override;
}

// untrack specified overload
function stop (request) {
    const { filename } = global.kequtest;
    const absolute = calcAbsolute(request, filename);
    delete overrides[absolute];
}

// untrack all overloads
function stopAll () {
    for (const absolute of Object.keys(overrides)) {
        delete overrides[absolute];
    }
}

// remove from node internal cache
function uncache (request) {
    const { filename } = global.kequtest;
    const absolute = calcAbsolute(request, filename);
    delete require.cache[absolute];
}

mock.stop = stop;
mock.stopAll = stopAll;

module.exports = { mock, uncache };

// convert request to absolute path
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
