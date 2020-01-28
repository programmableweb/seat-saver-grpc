const mongoose = require('mongoose');
const customer = mongoose.Schema({
    firstName:{type: String, required: true},
    lastName:{type: String, required: true},
    email: {type: String, required: true},
    created: {
        type: Date,
        default: Date.now
    }
});


const seat = mongoose.Schema({
    number:{type: String, required: true},
    section:{type: String, required: true},
    status:{type: String, required: true, default: 'OPEN'},
    customer: {
        firstName: String,
        lastName:  String,
        email: String
    },
    changed: {
        type: Date,
        default: Date.now
    },
    created: {
        type: Date,
        default: Date.now
    }
});
const venue = mongoose.Schema({
    name: {type: String, required: true},
    address: {type: String, required: true},
    city: {type: String, required: true},
    state_province: {type: String, required: true},
    postal_code: {type: String, required: true},
    country: {type: String, required: true},
    seats: [seat],
    created: {
        type: Date,
        default: Date.now
    }
});

const Venue = mongoose.model('Venue', venue);
module.exports = Venue;