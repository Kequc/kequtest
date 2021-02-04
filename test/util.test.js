const assert = require('assert');

it('is available globally', function () {
    assert.strictEqual(util, require('../src/util.js'));
    assert.strictEqual(typeof util.log, 'function');
    assert.strictEqual(typeof util.spy, 'function');
});

describe('log', function () {
    it('returns a mock console', function () {
        const result = util.log();
        assert.strictEqual(typeof result.debug, 'function');
        assert.strictEqual(typeof result.info, 'function');
        assert.strictEqual(typeof result.log, 'function');
        assert.strictEqual(typeof result.warn, 'function');
        assert.strictEqual(typeof result.error, 'function');
    });
});

describe('spy', function () {
    it('returns a function', function () {
        assert.strictEqual(typeof util.spy(), 'function');
    });

    it('calculates a result', function () {
        const spy = util.spy(name => 'hi ' + name);
        const result = spy('mark');
        assert.strictEqual(result, 'hi mark');
    });

    it('throws an error', function () {
        const spy = util.spy(() => { throw new Error('Test error'); });
        assert.throws(() => { spy('mark'); }, { message: /^Test error/ });
    });

    it('tracks calls', function () {
        const spy = util.spy(name => 'hi ' + name);
        assert.strictEqual(spy('mark', 1), 'hi mark');
        assert.strictEqual(spy('paul', 5), 'hi paul');
        assert.deepStrictEqual(spy.calls, [
            ['mark', 1],
            ['paul', 5]
        ]);
    });

    it('throws an error when spy is not a function', function () {
        assert.throws(() => { util.spy(null); }, { message: /^Spy must be a function/ });
        assert.throws(() => { util.spy(1); }, { message: /^Spy must be a function/ });
    });
});
