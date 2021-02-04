const assert = require('assert');

it('is available globally', function () {
    assert.strictEqual(util.mock, require('../src/mock.js'));
    assert.strictEqual(typeof util.mock, 'function');
    assert.strictEqual(typeof util.mock.stop, 'function');
    assert.strictEqual(typeof util.mock.stopAll, 'function');
});

util.mock('./deep/other.js', {
    getData: () => ({ id: 'fake-id', name: 'Paul' })
});

it('mocks', function () {
    const result = require('./fake-src/index.js');

    assert.strictEqual(result.getData().id, 'fake-id');
});

describe('inside a block', function () {
    util.mock('./fake-src/deep/other.js', {
        getData: () => ({ id: 'fake-id', name: 'paul' })
    });
    
    it('mocks', function () {
        const result = require('./fake-src/deep/other.js');
    
        assert.strictEqual(result.getData().id, 'fake-id');
    });
});

it('stops mocking at end of blocks', function () {
    const result = require('./fake-src/deep/other.js');

    assert.strictEqual(result.getData().id, 'real-id');
});
