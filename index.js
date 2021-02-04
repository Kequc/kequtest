#!/usr/bin/env node
const path = require('path');

const directory = path.join(process.cwd(), process.argv[2] || '.');
const extensions = ['.test.js'];

require('./src/main.js')(console, directory, extensions);
