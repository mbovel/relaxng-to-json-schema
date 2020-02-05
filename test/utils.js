const fs = require("fs");
const path = require("path");

function loadJSDOM() {
	const { JSDOM } = require("jsdom");
	const window = new JSDOM("").window;
	for (const key of ["DOMParser", "Node"]) {
		global[key] = window[key];
	}
}

/**
 * @param {string} filename
 * @returns {Element}
 */
function readXML(filename) {
	return new DOMParser().parseFromString(fs.readFileSync(filename, "utf-8"), "text/xml")
		.children[0];
}

/**
 * @param {string} filename
 * @returns {Document}
 */
function readJSON(filename) {
	return JSON.parse(fs.readFileSync(filename, "utf-8"));
}

/**
 * @param {string} examplePath
 */
function readExample(examplePath) {
	return {
		xmlSchema: readXML(path.join(examplePath, "schema.rng")),
		xmlContent: readXML(path.join(examplePath, "content.xml")),
		jsonSchema: readJSON(path.join(examplePath, "schema.json")),
		jsonContent: readJSON(path.join(examplePath, "content.json"))
	};
}

exports.loadJSDOM = loadJSDOM;
exports.readJSON = readJSON;
exports.readXML = readXML;
exports.readExample = readExample;
