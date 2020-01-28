/**
 * @param {string} input
 * @returns {Document}
 */
export function parseXML(input) {
	return (new DOMParser()).parseFromString(input, "text/xml");
}