grunt-amd-dist
=============

grunt-amd-dist is a [grunt](http://gruntjs.com/) task to build JavaScript
projects which use the AMD format.


Installataion
-------------

From the same directory as your Gruntfile, run

```
npm install grunt-amd-dist
```

Then add the following line to your Gruntfile:

```js
grunt.loadNpmTasks('grunt-amd-dist');
```

You can verify that the task is available by running `grunt --help` and
checking that "dist" is under "Available tasks".


Usage
-----

grunt-amd-dist reads two sections of your config: `dist` and `requirejs`. `dist`
can contain these properties (example from
[deferreds.js](https://github.com/zship/deferreds.js)):

```js
dist: {
	//path of the built file
	out: 'dist/deferreds.js',
	//remove requirejs dependency from built package (using almond)
	standalone: true,
	//build standalone for node or browser
	env: 'node',
	//env: 'browser',
	//if env === 'browser', this is the property under `window` which is
	//assigned the exported modules
	exports: 'deferreds',
	//String or Array of files for which to trace dependencies and build
	include: 'src/deferreds/**/*.js',
	//exclude files from the 'include' list. Useful to add specific
	//exceptions to globbing.
	exclude: [],
	//exclude files and their dependencies from the *built* source
	//Difference from 'exclude': files in 'excludeBuilt' will be
	//excluded even if they are dependencies of files in 'include'
	excludeBuilt: [],
	//exclude files from the *built* source, but keep any dependencies of the files.
	excludeShallow: []
},
```

`requirejs` is a standard [r.js configuration
object](https://github.com/jrburke/r.js/blob/master/build/example.build.js).
grunt-amd-dist uses `basePath`, `paths`, and `packages` (all optional) to
transform file names to AMD module names.

Once these options are in place, `grunt dist` will run grunt-amd-dist.


### Standalone build

The `standalone` option will cause the built file to export an object
containing all AMD modules which were part of the build. Depending on the `env`
option, this returned object is assigned to `module.exports` (node) or
`window.<config:dist.exports`. Object keys are the module names, values are the
modules.


Why?
----

The [r.js optimizer](https://github.com/jrburke/r.js) already performs the main
purpose of grunt-amd-dist, so why use this grunt task? Well, the main use case
for grunt-amd-dist is building library projects, where a build should include
all files. Normally, AMD libraries should be used as-is and built by the
consumer as part of their own projects' builds (to minimize the amount of
library code included to what is actually used). A library built through
grunt-amd-dist, then, would normally be intended as an alternative for consumers who
do not want to use an AMD loader. With that in mind, here's what grunt-amd-dist
provides:

1. Can specify files instead of module names, and use grunt's
   [globbing](https://github.com/gruntjs/grunt/blob/0.3-stable/docs/api_file.md#gruntfileexpand)
   to cut down on typing included files explicitly.
2. Built script can export an object containing all included modules, for use
   outside AMD loaders.
3. Can export for node or browsers.
