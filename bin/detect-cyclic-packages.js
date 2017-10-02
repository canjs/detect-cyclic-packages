#! /usr/bin/env node
var path = require("path");
var detect = require(path.join(__dirname, "../index"));

try {
  var cycles = detect(process.cwd(), process.argv.indexOf("--deep") > -1);
  process.exit(cycles.length);
} catch(e) {
  console.error(e);
  process.exit(1);
}
