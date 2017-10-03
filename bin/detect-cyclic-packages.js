#! /usr/bin/env node
var path = require("path");
var detect = require(path.join(__dirname, "../index"));

if(process.argv.indexOf("--help") > -1 || process.argv.indexOf("-?") > -1) {
  console.log(`Usage:
detect-cyclic-packages [--ignore pkg1,pkg2,...] [--deep]

Starting at the current folder, detect-cyclic-packages looks at the NPM module's
devDependencies and dependencies, and all of the dependencies of dependencies, 
to see if the current module is part of a dependency cycle.  If so, 
detect-cyclic-packages logs the cycle to stderr and exits with code 1.  If not,
no output is generated and exit code 0 is returned.

--ignore  don't descend into or inspect the specified packages
--deep    find cycles anywhere in the tree, not just those with the root module
`);
  process.exit(0);
}


var ignores = process.argv.indexOf("--ignore") + 1;
if(ignores) {
  ignores = process.argv[ignores].split(",");
} else {
  ignores = [];
}

try {
  var cycles = detect(process.cwd(), ignores, process.argv.indexOf("--deep") > -1);
  process.exit(cycles.length);
} catch(e) {
  console.error(e);
  process.exit(1);
}
