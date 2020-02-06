/**
 * Converts XML data into a JSON representation according to a JSON schema obtained from relaxngToJsonSchema.
 *
 * @param {Element} data XML data (must already have been parsed into a DOM Element)
 * @param {any} schema JSON schema (obtained from relaxngToJsonSchema)
 * @returns {any} JSON data corresponding to the XML Content
 */
export default function xmlToJson(data, schema) {
	if (schema.oneOf) {
		for (const subSchema of schema.oneOf) {
			const value = childXmlToJson(data, subSchema);
			if (value) return value;
		}
		return null;
	}

	switch (schema.type) {
		case "boolean":
		case "number":
		case "string":
			return textToJson(popText(data), schema);
		case "object": {
			const result = {};
			for (const key in schema.properties) {
				const value = childXmlToJson(data, schema.properties[key]);
				if (value === null && schema.required.includes(key)) return null;
				if (value !== null) result[key] = value;
			}
			return result;
		}
		case "array": {
			const result = [];
			while (true) {
				const value = childXmlToJson(data, schema.items);
				if (value === null) break;
				result.push(value);
			}
			return result;
		}
	}
}

/**
 * @param {Element} parentData
 * @param {any} subSchema
 */
function childXmlToJson(parentData, subSchema) {
	if (subSchema["xml:element"]) {
		const data = popElement(parentData, subSchema["xml:element"]);
		if (data === null) return null;
		return xmlToJson(data, subSchema);
	} else if (subSchema["xml:attribute"]) {
		return textToJson(parentData.getAttribute(subSchema["xml:attribute"]), subSchema);
	} else {
		return xmlToJson(parentData, subSchema);
	}
}

/**
 * Converts a string to a JSON value according to a schema.
 *
 * @param {string|null} value
 * @param {any} schema
 */
function textToJson(value, schema) {
	if (value === null) return null;

	switch (schema.type) {
		case "boolean":
			return value !== "false";
		case "number":
			return parseFloat(value);
		case "string":
			return value;
		default:
			throw new Error("");
	}
}

/**
 * Finds an element with the given name and, if it exists, removes it and returns it.
 *
 * @param {Element} el Parent element
 * @param {string} tagName Tag name to search for
 * @returns {Element|null} Found element or null
 */
function popElement(el, tagName) {
	const result = el.querySelector(tagName);
	if (!result) return null;
	result.remove();
	return result;
}

/**
 * Finds a text node in el and, if it exists, removes it and returns its content.
 *
 * @param {Element} el Parent element
 * @returns {string|null} Text node's content as a string or null
 */
function popText(el) {
	for (const node of el.childNodes) {
		if (node.nodeType === Node.TEXT_NODE) {
			node.remove();
			// @ts-ignore (textContent is never null for an Element)
			return node.textContent.toString();
		}
	}
	return null;
}
