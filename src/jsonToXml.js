/**
 * @param {any} jsonData
 * @param {any} schema
 */
export default function jsonToXml(jsonData, schema, namespace = null) {
	const rootName = schema["xml:element"];
	if (!rootName) throw new Error("");
	const root = document.implementation.createDocument(namespace, rootName, null);
	_jsonToXml(jsonData, schema, root.documentElement, root);
	return root;
}

/**
 * @param {any} jsonData
 * @param {any} schema
 * @param {Element} xmlData
 * @param {Document} root
 */
function _jsonToXml(jsonData, schema, xmlData, root) {
	switch (schema.type) {
		case "boolean":
		case "number":
		case "string":
			xmlData.textContent = jsonData.toString();
			return;
		case "object":
			for (const key of schema["xml:order"]) {
				if (jsonData[key]) {
					childJsonToXml(jsonData[key], schema.properties[key], xmlData, root);
				}
			}
			return;
		case "array": {
			for (const item of jsonData) childJsonToXml(item, schema.items, xmlData, root);
			return;
		}
	}
}

/**
 * @param {any} jsonData
 * @param {any} schema
 * @param {Element} parentXmlData
 * @param {Document} root
 */
function childJsonToXml(jsonData, schema, parentXmlData, root) {
	if (schema.oneOf) {
		for (const subSchema of schema.oneOf) {
			if (schemaMatch(jsonData, subSchema)) {
				schema = subSchema;
				break;
			}
		}
	}

	if (schema["xml:element"]) {
		const xmlData = root.createElement(schema["xml:element"]);
		parentXmlData.appendChild(xmlData);
		_jsonToXml(jsonData, schema, xmlData, root);
		return;
	} else if (schema["xml:attribute"]) {
		parentXmlData.setAttribute(schema["xml:attribute"], jsonData.toString());
		return;
	} else {
		return _jsonToXml(jsonData, schema, parentXmlData, root);
	}
}

function schemaMatch(data, schema) {
	switch (schema.type) {
		case "boolean":
		case "number":
		case "string":
			return typeof data === schema.type;
		case "object":
			if (typeof data !== "object") return false;
			for (const key of schema["xml:order"]) {
				if (!data[key] && schema.required.includes[key]) return false;
			}
			return true;
		case "array": {
			return Array.isArray(data) && data.every(item => schemaMatch(item, schema.items));
		}
	}
}
