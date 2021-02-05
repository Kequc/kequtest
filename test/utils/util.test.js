const assert = require('assert');

it('is available globally', function () {
    assert.strictEqual(util, require('../../src/utils/util.js'));
    assert.strictEqual(typeof util.mock, 'function');
    assert.strictEqual(typeof util.mock.stop, 'function');
    assert.strictEqual(typeof util.mock.stopAll, 'function');
    assert.strictEqual(typeof util.spy, 'function');
    assert.strictEqual(typeof util.log, 'function');
});

it('returns a mock console', function () {
    const result = util.log();
    assert.strictEqual(typeof result.debug, 'function');
    assert.strictEqual(typeof result.info, 'function');
    assert.strictEqual(typeof result.log, 'function');
    assert.strictEqual(typeof result.warn, 'function');
    assert.strictEqual(typeof result.error, 'function');
});
