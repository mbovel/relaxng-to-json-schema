const assert = require("assert");
const glob = require("glob");
const { loadJSDOM, readExample } = require("./utils");
loadJSDOM();

describe("xmlToJson", () => {
	let xmlToJson;
	before(async () => {
		xmlToJson = (await import("../src/xmlToJson.js")).default;
	});

	it("correctly imports module", () => {
		assert.equal(typeof xmlToJson, "function");
	});

	for (const folder of glob.sync("examples/*")) {
		it("works with " + folder, () => {
			const { xmlContent, jsonSchema, jsonContent } = readExample(folder);
			assert.deepStrictEqual(xmlToJson(xmlContent, jsonSchema), jsonContent);
		});
	}
});
