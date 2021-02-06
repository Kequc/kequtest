const assert = require('assert');

util.mock('../fake-src/deep/other.js', {
    getData: () => ({ id: 'fake-id', name: 'Paul' })
});
util.mock('http', { ok: true });

it('mocks a module', function () {
    const result = require('http');

    assert.deepStrictEqual(result, { ok: true });
});

it('uncaches when told to', function () {
    const request = '../fake-src/index.js';
    const absolute = require.resolve(request);

    util.uncache(request); // uncache
    assert.ok(!require.cache[absolute]); // not cached
    require(request); // cache
    assert.ok(!!require.cache[absolute]); // cached
    util.uncache(request); // uncache
    assert.ok(!require.cache[absolute]); // not cached
});

it('mocks', function () {
    const result = require('../fake-src/index.js');

    assert.strictEqual(result.getData().id, 'fake-id');
});

describe('inside a block', function () {
    util.mock('../fake-src/deep/other.js', {
        getData: () => ({ id: 'fake-id', name: 'paul' })
    });
    
    it('mocks', function () {
        const result = require('../fake-src/deep/other.js');
    
        assert.strictEqual(result.getData().id, 'fake-id');
    });
});

it('stops mocking at end of blocks', function () {
    const result = require('../fake-src/deep/other.js');

    assert.strictEqual(result.getData().id, 'real-id');
});