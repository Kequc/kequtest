const path = require('path');
const fs = require('fs');

function findFiles (directory, argv, extensions) {
    const absolute = path.join(directory, argv || '.');

    try {
        if (!fs.existsSync(absolute)) {
            throw new Error(`Specified location doesn't exist. ${absolute}`);
        }
        if (!fs.statSync(absolute).isDirectory() && !isTestFile(absolute, extensions)) {
            throw new Error(`Not a valid test file. ${absolute}`);
        }
    } catch (error) {
        console.log('');
        console.error(error);
        console.log('');
        return [];
    }

    return scan(absolute, extensions);
}

function scan (absolute, extensions) {
    if (fs.statSync(absolute).isDirectory()) {
        const files = fs.readdirSync(absolute).filter(file => file !== 'node_modules');
        return files.reduce((acc, curr) => acc.concat(scan(path.join(absolute, curr), extensions)), []);
    } else if (isTestFile(absolute, extensions)) {
        return [absolute];
    } else {
        return [];
    }
}

function isTestFile (absolute, extensions) {
    for (const extension of extensions) {
        if (absolute.endsWith(extension)) return true;
    }
    return false;
}

module.exports = findFiles;
