const assert = require('assert');
const { pluralise, red, green, sequence } = require('../src/helpers.js');

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

describe('sequence', function () {
    it('runs promises in sequence', async function () {
        const result = [];

        function wait (ms) {
            return new Promise((resolve) => { setTimeout(resolve, ms); });
        }

        await sequence([
            async function () { result.push(0); },
            async function () { await wait(50); result.push(1); },
            async function () { result.push(2); }
        ]);

        assert.deepStrictEqual(result, [0, 1, 2]);
    });
});
