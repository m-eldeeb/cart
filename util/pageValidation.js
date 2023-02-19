const Ajv = require("ajv")
const ajv = new Ajv({ allErrors: true });


const schema = {
  type: "object",
  required: ["title", "content"],
  properties: {
    title: {
      type: "string",
      maxLength: 15,
      minLength: 4,
    },
    slug: { type: "string", maxLength: 15 },
    content: { type: "string", minLength: 5 },
  },
 
};
const validate = ajv.compile(schema);

module.exports = validate;


