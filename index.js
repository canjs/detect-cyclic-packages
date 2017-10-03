var fs = require("fs");
var path = require("path");

module.exports = function(rootDir, ignores, atAnyLevel) {
	var visited = {};

	if(Array.isArray(ignores)) {
		ignores.forEach(function(ignore) {
			visited[ignore] = true;
		});
	}

	function readPackage(folder, bases, readDevDeps) {
		// Assume that if a package folder doesn't exists where expected, it's been deduped
		//  elsewhere in the node_modules tree.
		var rootPkg = bases[0];
		var packageJson = require(path.join(folder, "package.json"));

		var depsToVisit = Object.keys(packageJson.dependencies || {});
		if(readDevDeps) {
			depsToVisit = Object.keys(packageJson.devDependencies || {});
		}

		var cycles = [];

		depsToVisit = depsToVisit.filter(function(dep) {
			// Found a cycle.  Mark it as such and leave.
			var matching = bases.indexOf(dep);
			if(matching > -1 && (atAnyLevel || matching <= 0)) {
				cycles.push(bases.slice(matching).concat(dep));
				return false;
			}
			// Have seen this package already.  Leave.
			if(visited[dep]) {
				return false;
			} else {
				// Encountered a new package.  Since we're going breadth first, mark it as seen and return for
				//   later deep diving.
				visited[dep] = true;
				return true;
			}
		});

		cycles = Array.prototype.concat.apply(cycles, depsToVisit.map(function(dep) {
			var newPath = path.join(folder, "node_modules", dep);
			if(fs.existsSync(newPath)) {
				return readPackage(newPath, bases.concat(dep));
			} else {
				newPath = path.join(rootDir, "node_modules", dep);
				if(fs.existsSync(newPath)) {
					return readPackage(newPath, bases.concat(dep));
				} else {
					return [];
				}
			}
		}));
		return cycles;
	}

	var cycles = readPackage(rootDir, [path.basename(rootDir)], true);

	cycles.map(function(cycle) {
		console.error("ERROR: A dependency cycle was detected in your package tree:\n" + cycle.join("\n-> "));
	});
	return cycles;
};
