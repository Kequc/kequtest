const assert = require('assert');

it('returns utility functions', function () {
    assert.strictEqual(util, require('../../src/util/util.js'));
    assert.strictEqual(typeof util.mock, 'function');
    assert.strictEqual(typeof util.mock.stop, 'function');
    assert.strictEqual(typeof util.mock.stopAll, 'function');
    assert.strictEqual(typeof util.uncache, 'function');
    assert.strictEqual(typeof util.spy, 'function');
    assert.strictEqual(typeof util.log, 'function');
});
