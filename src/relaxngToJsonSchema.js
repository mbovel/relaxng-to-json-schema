import { parseXML } from "./utils.js";

const RNGJS_NS = "https://github.com/mbovel/autoui";
const RNG_NS = "http://relaxng.org/ns/structure/1.0";

/**
 * A number, or a string containing a number.
 * @typedef {(number|string|boolean|Array|Object)} JSONType
 */

/**
 * @param {string} schemaString
 * @returns {JSONType}
 */
export default function relaxngToJsonSchema(schemaString) {
	const root = parseXML(schemaString);
	return convert(root.children[0], root);
}

/**
 * @param {Element} el
 * @param {Document} root
 * @returns {JSONType}
 */
function convert(el, root) {
	const title = getElementTitle(el);
	switch (el.tagName) {
		case "optional":
		case "element":
		case "attribute":
		case "group":
		case "start":
		case "define":
			const schema = convertSequence(el.children, root);
			schema["title"] = title || schema["title"];
			if (el.tagName === "element")
				schema["xml:element"] = el.getAttribute("name").toString();
			if (el.tagName === "attribute")
				schema["xml:attribute"] = el.getAttribute("name").toString();
			return schema;
		case "zeroOrMore":
			return { type: "array", items: convertSequence(el.children, root), title };
		case "oneOrMore":
			return { type: "array", items: convertSequence(el.children, root), minItems: 1, title };
		case "choice":
			return { oneOf: [...el.children].map(c => convert(c, root)), title };
		case "grammar":
			return convert(find(root, "start"), root);
		case "value":
			return { type: "string", const: el.textContent };
		case "data":
			return { type: "string" };
		case "text":
			return { type: "string" };
		case "ref":
			const name = el.getAttribute("name");
			if (!name) throw new Error("");
			return convert(find(root, `define[name='${name}']`), root);
		default:
			throw new Error("Unknown tag name: " + el.tagName);
	}
}

let noNameCounter = 1;

/**
 * @param {Element} el
 * @returns {string}
 */
function getElementKey(el) {
	return (
		el.getAttributeNS(RNGJS_NS, "key") || el.getAttribute("name") || "$noName" + ++noNameCounter
	);
}

/**
 * @param {Element} el
 * @returns {string}
 */
function getElementTitle(el) {
	return el.getAttributeNS(RNGJS_NS, "title") || el.getAttribute("name") || undefined;
}

/**
 * @param {HTMLCollection} children
 * @param {Document} root
 * @returns {JSONType}
 */
function convertSequence(children, root) {
	if (children.length === 1) return convert(children[0], root);

	const properties = {};
	const order = [];
	const required = [];

	for (const child of children) {
		if (!isRngElement(child)) continue;

		const key = getElementKey(child);
		properties[key] = convert(child, root);
		order.push(key);

		if (child.localName !== "optional") required.push(key);
	}

	return { type: "object", properties, required, "xml:order": order };
}

/**
 * @param {Document} root
 * @param {string} query
 * @returns {Element}
 */
function find(root, query, namespace = RNG_NS) {
	const results = [...root.querySelectorAll(query)].filter(
		node => node.namespaceURI === namespace
	);
	if (results.length < 1) throw new Error("");
	return results[0];
}

const nodeNames = new Set([
	"zeroOrMore",
	"oneOrMore",
	"optional",
	"element",
	"attribute",
	"group",
	"choice",
	"grammar",
	"value",
	"data",
	"text",
	"ref"
]);

/**
 * @param {Element} node
 */
function isRngElement(node) {
	return node.namespaceURI === RNG_NS && nodeNames.has(node.tagName);
}
