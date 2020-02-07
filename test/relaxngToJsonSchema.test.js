const assert = require("assert");
const path = require("path");
const glob = require("glob");
const { loadJSDOM, readExample } = require("./utils");
loadJSDOM();

describe("relaxngToJsonSchema", () => {
	let relaxngToJsonSchema;
	before(async () => {
		relaxngToJsonSchema = (await import("../src/relaxngToJsonSchema.js")).default;
	});

	it("correctly imports module", () => {
		assert.equal(typeof relaxngToJsonSchema, "function");
	});

	for (const folder of glob.sync("examples/*")) {
		it("works with " + folder, () => {
			const { xmlSchema, jsonSchema } = readExample(folder);
			assert.deepStrictEqual(relaxngToJsonSchema(xmlSchema), jsonSchema);
		});
	}
});
