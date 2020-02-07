# RelaxNG to Json Schema

This library contains functions to convert *simple* RelaxNG schemas to JSON Schemas and to convert between corresponding XML documents and JSON files. 

The primary use-case is the generation of web UIs for XML data using existing libraries based on JSON schemas like [React Json Schema Form](https://github.com/rjsf-team/react-jsonschema-form) or [AutoUI](https://github.com/mbovel/autoui).

## Demonstration

A live playground can be found here: <https://mbovel.github.io/relaxng-to-json-schema/demo/playground.html>. It uses React Json Schema Form to display the UI.

## Usage

```html
<script type="module">
import relaxngToJsonSchema from "../src/relaxngToJsonSchema.js";
import xmlToJson from "../src/xmlToJson.js";

const rngSchema = parseXML(`
	<element name="addressBook" xmlns="http://relaxng.org/ns/structure/1.0">
		<zeroOrMore>
			<element name="card">
			<element name="name">
				<text/>
			</element>
			<element name="email">
				<text/>
			</element>
			</element>
		</zeroOrMore>
	</element>
`)

const xmlContent = parseXML(`
	<addressBook>
		<card>
			<name>John Smith</name>
			<email>js@example.com</email>
		</card>
		<card>
			<name>Fred Bloggs</name>
			<email>fb@example.net</email>
		</card>
	</addressBook>
`)

const jsonSchema = relaxngToJsonSchema(rngSchema);
const jsonContent = xmlToJson(xmlContent, jsonSchema);

function parseXML(input) {
	return new DOMParser().parseFromString(input, "text/xml").documentElement;
}
</script>
```

See full minimal working example in [demo/minimal.html](https://github.com/mbovel/relaxng-to-json-schema/blob/master/demo/minimal.html).

## Examples

Conversion examples can be found in the [`examples` directory](https://github.com/mbovel/relaxng-to-json-schema/tree/master/examples).

## Development setup

In order to use the library, you don't need to install anything as it is written in modern JavaScript directly understandable by modern browsers.

To run the tests, you will need to:

- Install [Node.js](https://nodejs.org/en/) **with a version higher than or equal to 13.8.0**,
- Install the dependencies by running `npm install` in this directory.
