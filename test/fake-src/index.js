const other = require('./deep/other.js');

function myLib () {
    return other.getData();
}

module.exports = myLib;
