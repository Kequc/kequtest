const path = require("path");
const fs = require("fs");

// Finds all files with the given extension
function findFiles(directory, extensions) {
    let files = [];

    for (const file of fs.readdirSync(directory)) {
        const absolute = path.join(directory, file);

        if (fs.statSync(absolute).isDirectory()) {
            files = files.concat(scan(absolute));
        } else if (isTestFile(file, extensions)) {
            files.push(absolute);
        }
    }

    return files;
}

function isTestFile (file, extensions) {
    for (const extension of extensions) {
        if (file.endsWith(extension)) return true;
    }
    return false;
}

module.exports = findFiles;
