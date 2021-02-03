const assert = require('assert');
const { pluralise } = require('../src/helpers.js');

describe('pluralise', function () {
    it('pluralises a word', function () {
        const result = pluralise(0, 'cat');
        assert.strictEqual(result, '0 cats');
    });

    it('does not pluralise a word', function () {
        const result = pluralise(1, 'cat');
        assert.strictEqual(result, '1 cat');
    });

    it('uses customised plural', function () {
        const result = pluralise(2, 'cat', 'dogs');
        assert.strictEqual(result, '2 dogs');
    });

    it('does not use customised plural', function () {
        const result = pluralise(1, 'cat', 'dogs');
        assert.strictEqual(result, '1 cat');
    });
});
