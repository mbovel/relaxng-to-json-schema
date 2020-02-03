const assert = require("assert");
const fs = require("fs");
const glob = require("glob");
const { assertJsonSnapshotMatch, loadJSDOM } = require("./utils");
loadJSDOM();

describe("relaxngToJsonSchema", () => {
	/**
	 * Code in the `src` folder uses the new ECMAScript modules syntax to define modules. This is the official standard
	 * format to package JavaScript code for reuse, and will eventually be fully supported in all browsers and Node.js.
	 *
	 * However, ECMAScript modules are *still* experimental in Node.js. Currently, in order to be able to use them with
	 * Mocha.js (which imports tests using CommonJS `require` function), we need to make our tests a CommonJS module and
	 * import our ECMAScript modules using a dynamic import (`import(...)`). We use the `before` hook from Mocha to do
	 * it before the tests.
	 *
	 * See:
	 * - Node.js ECMAScript Modules > Introduction: https://nodejs.org/api/esm.html#esm_introduction
	 * - Node.js ECMAScript Modules > Interoperability with CommonJS:
	 *   https://nodejs.org/api/esm.html#esm_interoperability_with_commonjs
	 * - Mocha ES6 tests issue: https://github.com/mochajs/mocha/issues/3006
	 * - V8 dynamic import: https://v8.dev/features/dynamic-import
	 * - Mocha file loading source code: https://github.com/mochajs/mocha/blob/master/lib/mocha.js#L311
	 * - Node.js (node:8619) ExperimentalWarning: https://github.com/nodejs/node/issues/30213
	 */
	let relaxngToJsonSchema;
	before(async () => {
		relaxngToJsonSchema = (await import("../src/relaxngToJsonSchema.js")).default;
	});

	it("correctly imports module", () => {
		assert.equal(typeof relaxngToJsonSchema, "function");
	});

	for (const file of glob.sync("examples/*.rng")) {
		it("works with example " + file, () => {
			const input = fs.readFileSync(file, "utf-8");
			const result = relaxngToJsonSchema(input);
			assertJsonSnapshotMatch(result, file.replace(/\.rng$/, ".json"));
		});
	}
});
