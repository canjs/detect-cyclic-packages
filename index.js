var fs = require("fs");
var path = require("path");
var visited = {};

function readPackage(folder, depth, readDevDeps) {
	// Assume that if a package folder doesn't exists where expected, it's been deduped
	//  elsewhere in the node_modules tree.
	if(fs.existsSync(folder)) {
		var rootDir = path.basename(depth[0]);
		var packageJson = require(path.join(folder, "package.json"));

		var depsToVisit = Object.keys(packageJson.dependencies || {});
		if(readDevDeps) {
			depsToVisit = Object.keys(packageJson.devDependencies || {});
		}

		var cycles = [];

		depsToVisit = depsToVisit.filter(function(dep) {
			if(dep === rootDir) {
				cycles.push(depth.concat([path.join(folder, "node_modules", dep)]));
				// throw "ERROR: A dependency cycle was detected in your package tree:\n" + 
				// 	depth.concat([path.join(folder, "node_modules", dep)]).join("\n-> ");
			}
			if(visited[dep]) {
				return false;
			} else {
				visited[dep] = true;
				return true;
			}
		});

		cycles = Array.prototype.concat.apply(cycles, depsToVisit.map(function(dep) {
			var newPath = path.join(folder, "node_modules", dep);
			return readPackage(newPath, depth.concat(newPath));
		}));
		return cycles;
	} else {
		return [];
	}
}

module.exports = function(dir) {
	var rootDir = path.basename(process.cwd());
	var cycles = readPackage(dir, [dir], true);

	cycles.map(function(cycle) {
		console.error("ERROR: A dependency cycle was detected in your package tree:\n" + cycle.join("\n-> "));
	});
	return cycles;
};
