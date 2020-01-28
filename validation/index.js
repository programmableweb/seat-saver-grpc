const Validator = require('jsonschema').Validator;
const v = new Validator();

const validateEnvVarsSync = () => {
    const errors = [];
    if (!process.env.MONGODB_URL) errors.push("Missing EnvVar: MONGODB_URL");
    if (errors.length > 0) throw new Error(JSON.stringify(errors));
};

const seatSchema = {
    "id": "/Seat",
    "type": "object",
    "properties": {
        "id": {"type": "string"},
        "number": {"type": "string"},
        "section": {"type": "string"},
        "status": {"type": "string"},
        "customer": {
         "oneOf": [
          {"type": "null"},
          {"$ref":"/Customer"}
         ]
        },
        "created": {"type": "string"},
        "changed": {"type": "string"},
    },
    "required": ["number", "section", "status"]
};

const validateSeatSync = (seat) => {
 v.addSchema(customerSchema, '/Customer');
 return v.validate(seat, seatSchema)
};

const customerSchema = {
    "id": "/Customer",
    "type": "object",
    "properties": {
        "id": {"type": "string"},
        "firstName": {"type": "string"},
        "lastName": {"type": "string"},
        "email": {"type": "string"},
        "created": {"type": "string"},
        "changed": {"type": "string"},
    },
    "required": ["firstName", "lastName", "email"]
};

const validateCustomerSync = (customer) => {
    return v.validate(customer, customerSchema)
};

const venueSchema = {
    "id": "/Venue",
    "type": "object",
    "properties": {
        "id": {"type": "string"},
        "name": {"type": "string"},
        "address": {"type": "string"},
        "city": {"type": "string"},
        "state_province": {"type": "string"},
        "postal_code": {"type": "string"},
        "country": {"type": "string"},
        "created": {"type": "string"},
        "changed": {"type": "string"},
        "seats": {
            "type": "array",
            "items": {"$ref": "/Seat"}
        }
    },
    "required": ["name", "address", "city", "state_province", "postal_code","seats"]
};

const validateVenueSync = (venue) => {
    v.addSchema(customerSchema, '/Customer');
    v.addSchema(seatSchema, '/Seat');
    return v.validate(venue, venueSchema)
};
module.exports = {validateEnvVarsSync, validateCustomerSync, validateSeatSync, validateVenueSync};