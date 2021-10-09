#!/usr/bin/env node
import path from 'path';
import kequtest from './main';

const args = process.argv.slice(2);

const targets = extractTargets(args);
const absolutes = targets.map(target => path.join(process.cwd(), target));
const exts = ['.test.js'];

if (isTs(args, targets)) {
    // add typescript support
    exts.push('.test.ts');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('ts-node').register({
        transpileOnly: true
    });
}

kequtest(console, absolutes, exts);

function extractTargets (args: string[]) {
    const result = args.filter(arg => arg[0] !== '-');
    if (result.length < 1) result.push('.');
    return result;
}

function isTs (args: string[], targets: string[]) {
    return args.includes('--ts') || targets.some(target => target.endsWith('.test.ts'));
}
