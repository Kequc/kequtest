import assert from 'assert';
import { pluralize, red, green } from '../../src/util/helpers';

describe('pluralize', function () {
    it('pluralises a word', function () {
        const result = pluralize(0, 'cat');
        assert.strictEqual(result, '0 cats');
    });

    it('does not pluralize a word', function () {
        const result = pluralize(1, 'cat');
        assert.strictEqual(result, '1 cat');
    });

    it('uses customised plural', function () {
        const result = pluralize(2, 'cat', 'dogs');
        assert.strictEqual(result, '2 dogs');
    });

    it('does not use customised plural', function () {
        const result = pluralize(1, 'cat', 'dogs');
        assert.strictEqual(result, '1 cat');
    });
});

describe('red', function () {
    it('adds red around text', function () {
        assert.strictEqual(red('test 1'), '\x1b[31mtest 1\x1b[0m');
    });
});

describe('green', function () {
    it('adds green around text', function () {
        assert.strictEqual(green('test 1'), '\x1b[32mtest 1\x1b[0m');
    });
});
