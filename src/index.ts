#!/usr/bin/env node
import path from 'path';
import kequtest from './main';

const absolute = path.join(process.cwd(), process.argv[2] || '.');
const exts = ['.test.js', '.test.ts'];

kequtest(console, absolute, exts);
