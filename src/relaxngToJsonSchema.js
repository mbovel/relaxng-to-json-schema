const RNGJS_NS = "https://github.com/mbovel/relaxng-to-json-schema";
const RNG_NS = "http://relaxng.org/ns/structure/1.0";

/**
 * @param {Element} el
 * @param {Element} root
 * @returns {any}
 */
export default function relaxngToJsonSchema(el, root = el) {
	const title = getElementTitle(el);
	switch (el.tagName) {
		case "optional":
		case "element":
		case "attribute":
		case "group":
		case "start":
		case "define":
			const schema = convertSequence(el.children, root);
			schema["title"] = title || schema["title"] || null;
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
			return {
				oneOf: sortOneOf([...el.children].map(c => relaxngToJsonSchema(c, root))),
				title
			};
		case "grammar":
			return relaxngToJsonSchema(find(root, "start"), root);
		case "value":
			return { type: "string", const: el.textContent };
		case "data":
			return { type: "string" };
		case "text":
			return { type: "string" };
		case "ref":
			const name = el.getAttribute("name");
			if (!name) throw new Error("");
			return relaxngToJsonSchema(find(root, `define[name='${name}']`), root);
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
	return el.getAttributeNS(RNGJS_NS, "title") || el.getAttribute("name");
}

/**
 * @param {HTMLCollection} children
 * @param {Element} root
 * @returns {any}
 */
function convertSequence(children, root) {
	if (children.length === 1) return relaxngToJsonSchema(children[0], root);

	const properties = {};
	const order = [];
	const required = [];

	for (const child of children) {
		if (!isRngElement(child)) continue;

		const key = getElementKey(child);
		properties[key] = relaxngToJsonSchema(child, root);
		order.push(key);

		if (child.localName !== "optional") required.push(key);
	}

	return { type: "object", properties, required, "xml:order": order };
}

/**
 * @param {Element} root
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

const oneOfOrder = ["object", "array", "string", "number", "boolean"];
/**
 * @param {any[]} items
 */
function sortOneOf(items) {
	// See `compareNumbers` in https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
	return items.sort((a, b) => oneOfOrder.indexOf(a["type"]) - oneOfOrder.indexOf(b["type"]));
}
