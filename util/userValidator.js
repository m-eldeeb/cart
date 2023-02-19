const Ajv = require("ajv");
const ajv = new Ajv({ allErrors: true});

const schema = {
  type: "object",
  required: ["name", "email", "username", "password", "password2"],
  properties: {
    name: {
      type: "string",
      maxLength: 15,
      minLength: 4,
    },
    email: {
      type: "string",
      minLength: 4,
    },
    username: {
      minLength: 4,
      type: "string",
    },

    password: { type: "string", minLength: 8 },
    password2: {
    
      type: "string",
      minLength: 8,
    },
  },
};
const validate = ajv.compile(schema);

module.exports = validate;
