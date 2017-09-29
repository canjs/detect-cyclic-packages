#! /usr/bin/env node
var path = require("path");
var detect = require(path.join(__dirname, "../index"));

try {
  var cycles = detect(process.cwd());
  process.exit(cycles.length);
} catch(e) {
  console.error(e);
  process.exit(1);
}
