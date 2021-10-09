import assert from 'assert';

describe('mock', function () {
    util.mock('../fake-src/deep/other.js', {
        getData: () => ({ id: 'fake-id', name: 'Paul' })
    });
    util.mock('http', { ok: true });

    it('mocks a module', function () {
        const result = require('http');

        assert.deepStrictEqual(result, { ok: true });
    });

    it('throws an error when request is not a string', function () {
        assert.throws(() => { util.mock(null as any, null); }, { message: /^Target must be a string/ });
        assert.throws(() => { util.mock.stop(null); }, { message: /^Target must be a string/ });
    });

    it('mocks a relative path', function () {
        const result = require('../fake-src/index.js');

        assert.strictEqual(result.getData().id, 'fake-id');
    });

    it('mocks a relative path without an extension', function () {
        const result = require('../fake-src/index');

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

    describe('inside a block again', function () {
        util.mock('../fake-src/deep/other', {
            getData: () => ({ id: 'fake-id', name: 'paul' })
        });
        
        it('mocks without an extension', function () {
            const result = require('../fake-src/deep/other.js');
        
            assert.strictEqual(result.getData().id, 'fake-id');
        });
    });
});

describe('uncache', function () {
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

    it('throws an error when request is not a string', function () {
        assert.throws(() => { util.uncache(null); }, { message: /^Target must be a string/ });
    });
});
