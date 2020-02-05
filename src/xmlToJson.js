/**
 * @param {Element} content
 * @param {any} schema
 */
export default function xmlToJson(content, schema) {
	if (content === null) return null;

	if (schema.oneOf) {
		for (const subSchema of schema.oneOf) {
			const value = _xmlToJson(content, subSchema);
			if (value) return value;
		}
		return null;
	}

	switch (schema.type) {
		case "boolean":
		case "number":
		case "string":
			return textToJson(popText(content), schema);
		case "object": {
			const result = {};
			for (const key in schema.properties) {
				const value = _xmlToJson(content, schema.properties[key]);
				if (value === null && schema.required.includes(key)) return null;
				if (value !== null) result[key] = value;
			}
			return result;
		}
		case "array": {
			const result = [];
			while (true) {
				const value = _xmlToJson(content, schema.items);
				if (value === null) break;
				result.push(value);
			}
			return result;
		}
	}
}

/**
 * @param {Element} parentContent
 * @param {any} subSchema
 */
function _xmlToJson(parentContent, subSchema) {
	if (subSchema["xml:element"]) {
		return xmlToJson(popElement(parentContent, subSchema["xml:element"]), subSchema);
	} else if (subSchema["xml:attribute"]) {
		return textToJson(parentContent.getAttribute(subSchema["xml:attribute"]), subSchema);
	} else {
		return xmlToJson(parentContent, subSchema);
	}
}

/**
 * @param {string|null} value
 * @param {any} schema
 */
function textToJson(value, schema) {
	switch (schema.type) {
		case "boolean":
			return value !== null && value !== "false";
		case "number":
			return parseFloat(value);
		case "string":
			return value;
		default:
			throw new Error("");
	}
}

/**
 * @param {Element} el
 * @param {string} tagName
 * @returns {Element}
 */
function popElement(el, tagName) {
	const result = el.querySelector(tagName);
	if (!result) return null;
	result.remove();
	return result;
}

/**
 * @param {Element} el
 * @returns {string}
 */
function popText(el) {
	for (const node of el.childNodes) {
		if (node.nodeType === Node.TEXT_NODE) {
			node.remove();
			return node.textContent.toString();
		}
	}
	return null;
}
