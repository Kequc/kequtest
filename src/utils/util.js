const mock = require('./mock.js');
const spy = require('./spy.js');

function log () {
    return {
        debug: spy(),
        info: spy(),
        log: spy(),
        warn: spy(),
        error: spy()
    };
}

module.exports = { mock, spy, log };
