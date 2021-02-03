const path = require('path');
const fs = require('fs');

const IGNORE = ['node_modules'];

function findFiles (log, absolute, extensions) {
    try {
        if (!fs.existsSync(absolute)) {
            throw new Error(`Specified location doesn't exist. ${absolute}`);
        }
        if (!isDirectory(absolute) && !isTestFile(absolute, extensions)) {
            throw new Error(`Not a valid test file. ${absolute}`);
        }
    } catch (error) {
        log.info('');
        log.error(error);
        log.info('');
        return [];
    }

    return scan(absolute, extensions);
}

function scan (absolute, extensions) {
    if (isDirectory(absolute)) {
        const files = fs.readdirSync(absolute);
        return files.reduce((acc, curr) => acc.concat(scan(path.join(absolute, curr), extensions)), []);
    } else if (isTestFile(absolute, extensions)) {
        return [absolute];
    } else {
        return [];
    }
}

function isDirectory (absolute) {
    if (!fs.statSync(absolute).isDirectory()) return false;
    return !IGNORE.includes(absolute.split('/').pop());
}

function isTestFile (absolute, extensions) {
    for (const extension of extensions) {
        if (absolute.endsWith(extension)) return true;
    }
    return false;
}

module.exports = findFiles;
