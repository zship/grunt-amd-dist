'use strict';

var grunt = require('grunt');
var path = require('path');
var libdir = path.resolve(__dirname + '/lib');
var requirejs = require(libdir + '/r.js');
var util = require('./util.js');
var Deferred = require('deferreds').Deferred;
var pipe = require('deferreds').pipe;
var partial = require('mout/function/partial');
var _ = require('underscore');


var combine = function(src, dest, options) {
	return pipe(

		partial(util.loadConfig, options.requirejs),

		function(rjsconfig) {
			var deferred = new Deferred();

			var files = grunt.file.expand({filter: 'isFile'}, src).map(function(f) {
				return util.fileToModuleName(f, rjsconfig);
			});

			var config = {};
			config.out = dest;
			config.include = files;

			//use almond to remove requirejs dependency
			if (options.standalone) {
				config.name = util.fileToModuleName(libdir + '/almond.js', rjsconfig);
				config.wrap = {};
				if (options.env === 'node') {
					config.wrap.start = 'module.exports = (function() {\n\t"use strict";';
				}
				else {
					config.wrap.start = 'window["' + options.exports + '"] = (function() {\n\t"use strict";';
				}
				config.wrap.end = '';
			}
			else {
				config.wrap = {};
				config.wrap.start = '(function() {\n\t"use strict";';
				config.wrap.end = '\n})();';
			}


			//------------------------------------------------------------
			// Merge our config values into a config object compatible with
			// requirejs
			//------------------------------------------------------------
			config = _.extend(_.clone(rjsconfig), config);

			requirejs.optimize(config, function(buildResponse) {
				//grunt.log.writeln(buildResponse);

				if (!options.standalone) {
					deferred.resolve();
					return;
				}

				//when built as a standalone library, provide global
				//references to every object in the whole dependency graph
				//var basePath = _.initial(__dirname.split('/')).join('/');
				var deps = buildResponse.split('\n');
				deps = _.chain(deps)
					.compact()
					.rest(2)
					.map(function(file) {
						return util.fileToModuleName(file, rjsconfig);
					})
					.filter(function(file) {
						//a plugin, not a file
						return file.search(/!/g) === -1;
					})
					.value();

				if (options.standalone) {
					//take out almond.js reference
					deps = deps.slice(1);
				}


				var appendString = '\n\n/*\n';
				appendString += '-----------------------------------------\n';
				appendString += 'Global definitions for a built project\n';
				appendString += '-----------------------------------------\n';
				appendString += '*/\n\n';
				appendString += 'return {\n';
				deps.forEach(function(file, i) {
					appendString += '\t"' + file + '": require("' + file + '")';
					//appendString += 'lang.setObject("' + path.replace(/\//g, '.') + '", require("' + path + '"), window);\n';
					if (i < deps.length - 1) {
						appendString += ',\n';
					}
					else {
						appendString += '\n';
					}
				});
				appendString += '};\n';
				appendString += '\n\n})();';

				var contents = grunt.file.read(dest);
				contents += appendString;
				grunt.file.write(dest, contents, 'utf-8');

				deferred.resolve();
				return deferred;
			}

		);

	});
};

module.exports = combine;
