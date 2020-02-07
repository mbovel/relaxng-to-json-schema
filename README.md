This library contains functions to convert *simple* RelaxNG schemas to JSON Schemas and to convert between corresponding XML documents and JSON files. 

The primary use-case is the generation of web UIs for XML data using existing libraires based on JSON schemas like React Json Schema Forms or AutoUI.

## Demonstration

A live playground can be found here: <https://mbovel.github.io/relaxng-to-json-schema/demo/playground.html>.

## Usage

```javascript
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

See full minimal working example in <demo/minimal.html>