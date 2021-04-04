const path = require('path');
const fs = require('fs');

const IGNORE = ['node_modules'];

function findFilenames (log, absolute, exts) {
    try {
        if (!fs.existsSync(absolute)) {
            throw new Error(`Specified location doesn't exist. ${absolute}`);
        }
        if (!isDirectory(absolute) && !isTestFile(absolute, exts)) {
            throw new Error(`Not a valid test file. ${absolute}`);
        }
    } catch (error) {
        log.info('');
        log.error(error);
        log.info('');
        return [];
    }

    return scan(absolute, exts);
}

module.exports = findFilenames;

// recursive search
function scan (absolute, exts) {
    if (isDirectory(absolute)) {
        const filenames = fs.readdirSync(absolute);
        return filenames.reduce((acc, curr) => acc.concat(scan(path.join(absolute, curr), exts)), []);
    } else if (isTestFile(absolute, exts)) {
        return [absolute];
    } else {
        return [];
    }
}

function isDirectory (absolute) {
    if (fs.statSync(absolute).isDirectory()) {
        return !IGNORE.includes(absolute.split(path.sep).pop());
    }
    return false;
}

function isTestFile (absolute, exts) {
    for (const extension of exts) {
        if (absolute.endsWith(extension)) return true;
    }
    return false;
}
