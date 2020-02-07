Each folder corresponds to an example and contains the following files:

- `schema.rng` is the RelaxNG schema.
- `schema.json` is the corresponding JSON schema returned by `relaxngToJsonschema()`.
- `content.xml` is an example document corresponding to the RelaxNG schema.
- `content.json` is the corresponding JSON content returned by `xmlToJson()`.
- `contentNormalized.xml` is the result of converting the JSON content back to XML using `jsonToXml()` (note this is generally not equal to the initial XML).