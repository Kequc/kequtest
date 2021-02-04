#!/usr/bin/env node
const path = require('path');

const log = console;
const directory = path.join(process.cwd(), process.argv[2] || '.');
const exts = ['.test.js'];

require('./src/main.js')(log, directory, exts);
