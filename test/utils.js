const fs = require("fs");
const assert = require("assert");

/**
 * @param {any} actual
 * @param {string} snapshotFilename
 */
exports.assertJsonSnapshotMatch = function assertJsonSnapshotMatch(actual, snapshotFilename) {
	if (process.env["UPDATE_SNAPSHOTS"]) {
		fs.writeFileSync(snapshotFilename, JSON.stringify(actual, null, 4), "utf-8");
		return;
	}

	const expected = fs.existsSync(snapshotFilename)
		? JSON.parse(fs.readFileSync(snapshotFilename, "utf-8"))
		: {};
	assert.deepEqual(actual, expected);
};

exports.loadJSDOM = function() {
	const { JSDOM } = require("jsdom");
	global["DOMParser"] = new JSDOM("").window.DOMParser;
};
