const fs = require("fs");
const path = require("path");
const assert = require("assert");
const parseXml = require("@rgrove/parse-xml");

function loadJSDOM() {
	const { JSDOM } = require("jsdom");
	const window = new JSDOM("").window;
	for (const key of ["DOMParser", "XMLSerializer", "Node", "Text", "Element", "document"]) {
		global[key] = window[key];
	}
}

/**
 * @param {string} filename
 * @returns {Element}
 */
function readXML(filename) {
	const result = new DOMParser().parseFromString(fs.readFileSync(filename, "utf-8"), "text/xml")
		.documentElement;
	cleanXml(result);
	return result;
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

function assertXmlEquals(expected, actual) {
	assert.deepStrictEqual(xmlToString(expected), xmlToString(actual));
}

/**
 * @param {Node} node
 */
function cleanXml(node) {
	[...node.childNodes].forEach(cleanXml);
	// @ts-ignore (Text node's textContent is always non-null)
	if (node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) node.remove();
}

function xmlToString(el) {
	return new XMLSerializer().serializeToString(el);
}

exports.loadJSDOM = loadJSDOM;
exports.readJSON = readJSON;
exports.readXML = readXML;
exports.readExample = readExample;
exports.assertXmlEquals = assertXmlEquals;
