const assert = require('assert');
const mock = require('../src/mock.js');

it('is available globally', function () {
    assert.strictEqual(mock, require('../src/mock.js'));
    assert.strictEqual(typeof mock, 'function');
    assert.strictEqual(typeof mock.stop, 'function');
    assert.strictEqual(typeof mock.stopAll, 'function');
});

mock('./deep/other.js', {
    getData: () => ({ id: 'fake-id', name: 'Paul' })
});

it('mocks', function () {
    const myLib = require('./fake-src/index.js');

    assert.strictEqual(myLib().id, 'fake-id');
});

describe('inside a block', function () {
    mock('./fake-src/deep/other.js', {
        getData: () => ({ id: 'fake-id', name: 'Paul' })
    });
    
    it('mocks', function () {
        const myLib = require('./fake-src/deep/other.js');
    
        assert.strictEqual(myLib.getData().id, 'fake-id');
    });
});

it('stops mocking at end of blocks', function () {
    const myLib = require('./fake-src/deep/other.js');

    assert.strictEqual(myLib.getData().id, 'real-id');
});
