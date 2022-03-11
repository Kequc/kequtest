#!/usr/bin/env node
import path from 'path';
import CreateMocker, { IMock } from './env/mocker';
import CreateSummary from './env/summary';
import main from './main';
import { AsyncFunc, Func } from './types';
import { HookType } from './util/constants';
import {
    ISpyFunc,
    logger,
    spy,
    SpyLogger
} from './util/spy';

// env
process.env.NODE_ENV = process.env.NODE_ENV || 'test';

const args = process.argv.slice(2);
const targets = extractTargets(args);
const absolutes = targets.map(target => path.join(process.cwd(), target));
const exts = ['.test.js'];

if (args.includes('--ts') || targets.some(target => target.endsWith('.test.ts'))) {
    // add typescript support
    exts.push('.test.ts');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('ts-node').register({
        transpileOnly: true
    });
}

function extractTargets (args: string[]) {
    const result = args.filter(arg => arg[0] !== '-');
    if (result.length < 1) result.push('.');
    return result;
}

const summary = CreateSummary();
const { mock, uncache } = CreateMocker(summary);

// client
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
        logger: () => SpyLogger;
        spy: (method?: Func) => ISpyFunc;
    };
}

function describe (description: string, block?: AsyncFunc) {
    const { container } = summary;
    if (container) container.addContainer(description, block);
}
function it (description: string, block?: AsyncFunc) {
    const { container } = summary;
    if (container) container.addTest(description, block);
}

global.describe = describe;
global.it = it;

function createHook (hookType: HookType) {
    return function (block: AsyncFunc) {
        const { container } = summary;
        if (container) container.addHook(hookType, block);
    };
}

global.before = createHook(HookType.BEFORE);
global.beforeEach = createHook(HookType.BEFORE_EACH);
global.afterEach = createHook(HookType.AFTER_EACH);
global.after = createHook(HookType.AFTER);

global.util = {
    mock,
    uncache,
    logger,
    spy
};

// start tests
main(summary, console, absolutes, exts);
