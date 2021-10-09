#!/usr/bin/env node
import path from 'path';
import kequtest from './main';

import { Block, Func, Mock, SpyFunc, SpyLogger } from '../types';

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

declare global {
    function describe(description: string, block: Block): void;
    function it(description: string, block: Block): void;

    function before(block: Block): void;
    function beforeEach(block: Block): void;
    function afterEach(block: Block): void;
    function after(block: Block): void;

    // eslint-disable-next-line no-var
    var util: {
        mock: Mock;
        uncache: (request: string) => void;
        log: () => SpyLogger;
        spy: (method?: Func) => SpyFunc;
    };
}

function extractTargets (args: string[]) {
    const result = args.filter(arg => arg[0] !== '-');
    if (result.length < 1) result.push('.');
    return result;
}

function isTs (args: string[], targets: string[]) {
    return args.includes('--ts') || targets.some(target => target.endsWith('.test.ts'));
}
