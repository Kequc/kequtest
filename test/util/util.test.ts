import assert from 'assert';
import * as importedUtil from '../../src/util/util';

it('returns utility functions', function () {
    assert.strictEqual(util, importedUtil);
    assert.strictEqual(typeof util.mock, 'function');
    assert.strictEqual(typeof util.mock.stop, 'function');
    assert.strictEqual(typeof util.mock.stopAll, 'function');
    assert.strictEqual(typeof util.uncache, 'function');
    assert.strictEqual(typeof util.spy, 'function');
    assert.strictEqual(typeof util.log, 'function');
});
