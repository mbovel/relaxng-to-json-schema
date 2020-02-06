const assert = require("assert");
const glob = require("glob");
const { loadJSDOM, readExample, assertXmlEquals } = require("./utils");
loadJSDOM();

describe("jsonToXml", () => {
	let jsonToXml;
	before(async () => {
		jsonToXml = (await import("../src/jsonToXml.js")).default;
	});

	it("correctly imports module", () => {
		assert.equal(typeof jsonToXml, "function");
	});

	for (const folder of glob.sync("examples/*")) {
		it("works with " + folder, () => {
			const { xmlContentNormalized, jsonSchema, jsonContent } = readExample(folder);
			assertXmlEquals(jsonToXml(jsonContent, jsonSchema), xmlContentNormalized);
		});
	}
});
