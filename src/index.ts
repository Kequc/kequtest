#!/usr/bin/env node
import path from 'path';
import kequtest from './main';

import { AsyncFunc, Func, IMock, ISpyFunc, SpyLogger } from '../types';

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
    function describe(description: string, block?: AsyncFunc): void;
    function it(description: string, block?: AsyncFunc): void;

    function before(block: AsyncFunc): void;
    function beforeEach(block: AsyncFunc): void;
    function afterEach(block: AsyncFunc): void;
    function after(block: AsyncFunc): void;

    // eslint-disable-next-line no-var
    var util: {
        mock: IMock;
        uncache: (request: string) => void;
        log: () => SpyLogger;
        spy: (method?: Func) => ISpyFunc;
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
