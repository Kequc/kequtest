import fs from 'fs';
import path from 'path';
import { Logger } from '../types';

const IGNORE = ['node_modules'];

function findFilenames (logger: Logger, absolutes: string[], exts: string[]): string[] {
    for (const absolute of absolutes) {
        try {
            if (!fs.existsSync(absolute)) {
                throw new Error(`Specified location doesn't exist. ${absolute}`);
            }
            if (!isDirectory(absolute) && !isTestFile(absolute, exts)) {
                throw new Error(`Not a valid test file. ${absolute}`);
            }
        } catch (error) {
            logger.info('');
            logger.error(error);
            logger.info('');
            return [];
        }
    }

    return absolutes.reduce((acc: string[], absolute) => acc.concat(scan(absolute, exts)), []);
}

export default findFilenames;

// recursive search
function scan (absolute: string, exts: string[]): string[] {
    if (isDirectory(absolute)) {
        const filenames = fs.readdirSync(absolute);
        return filenames.reduce((acc: string[], filename) => acc.concat(scan(path.join(absolute, filename), exts)), []);
    } else if (isTestFile(absolute, exts)) {
        return [absolute];
    } else {
        return [];
    }
}

function isDirectory (absolute: string) {
    if (fs.statSync(absolute).isDirectory()) {
        return !IGNORE.includes(absolute.split(path.sep).pop() || '');
    }
    return false;
}

function isTestFile (absolute: string, exts: string[]) {
    for (const extension of exts) {
        if (absolute.endsWith(extension)) return true;
    }
    return false;
}
