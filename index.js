#!/usr/bin/env node
const path = require('path');

const absolute = path.join(process.cwd(), process.argv[2] || '.');
const exts = ['.test.js'];

require('./src/main.js')(console, absolute, exts);
