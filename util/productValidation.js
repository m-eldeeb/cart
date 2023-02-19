const Ajv = require("ajv");
const ajv = new Ajv({ allErrors: true });

const schema = {
  type: "object",
  required: ["title", "desc", "price"],
  properties: {
    title: {
      type: "string",
      maxLength: 50,
      minLength: 4,
    },
    desc: {
      type: "string",
      minLength: 4,
    },
    price: {
      type: "string",
    },

    slug: { type: "string", maxLength: 15 },
  },
};
const validate = ajv.compile(schema);

module.exports = validate;
