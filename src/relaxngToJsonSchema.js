import { parseXML } from "./utils.js"

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
export function relaxngToJsonSchema(schemaString) {
	const fullSchema = parseXML(schemaString);
	return convert(fullSchema.children[0], fullSchema)[1];
}

/**
 * @param {Element} el
 * @param {Document} root
 * @returns { [string, JSONType]}
 */
function convert(el, root) {
	let schema;
	switch (el.tagName) {
		case "zeroOrMore":
			schema = { type: "array", items: convertChildren(el.children, root) };
			break;
		case "oneOrMore":
			schema = { type: "array", items: convertChildren(el.children, root), minItems: 1 };
			break;
		case "optional":
			return convert(el.children[0], root);
		case "element":
		case "attribute":
		case "group":
			schema = convertChildren(el.children, root);
			break;
		case "choice":
			schema = { oneOf: [...el.children].map(c => convert(c, root)[1]) };
			break;
		case "grammar":
			schema = convertChildren(find(root, "start").children, root);
			break;
		case "value":
			schema = { type: "string", const: el.textContent };
			break;
		case "data":
			schema = { type: "string" };
			break;
		case "text":
			schema = { type: "string" };
			break;
		case "ref":
			const name = el.getAttribute("name");
			if (!name) throw new Error("")
			const defineEl = find(root, `define[name='${name}']`);
			schema = convertChildren(defineEl.children, root);
			break;
		default:
			throw new Error("Unknown tag name: " + el.tagName);
	}
	schema.title = getElementTitle(el);
	return [getElementKey(el), schema];
}

let noNameCounter = 1;

/**
 * @param {Element} el
 * @returns {string}
 */
function getElementKey(el) {
	const prefix = el.localName === "attribute" ? "@" : ""
	return prefix + (el.getAttributeNS(RNGJS_NS, "key") ?? el.getAttribute("name") ?? ("$noName" + ++noNameCounter));
}

/**
 * @param {Element} el
 * @returns {string}
 */
function getElementTitle(el) {
	return el.getAttributeNS(RNGJS_NS, "title") ?? el.getAttribute("name") ?? undefined;
}

/**
 * @param {HTMLCollection} children
 * @param {Document} root
 * @returns {JSONType}
 */
function convertChildren(children, root) {
	if (children.length === 1) return convert(children[0], root)[1];
	return { type: "object", properties: Object.fromEntries(convertAll(children, root)) };
}

/**
 * @param {HTMLCollection} els
 * @param {Document} root
 */
function convertAll(els, root) {
	return [...els].filter(isRngElement).map(c => convert(c, root));
}

/**
 * @param {Document} root
 * @param {string} query
 * @returns {Element}
 */
function find(root, query, namespace = RNG_NS) {
	return [...root.querySelectorAll(query)].filter(node => node.namespaceURI === namespace)[0];
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