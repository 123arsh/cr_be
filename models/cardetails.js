const { model, Schema } = require('mongoose');
const carsDataSchema = new Schema({
    name: {
        type: String,
        required: true,
        index: true,
    },
    catagory: {
        type: String,
        required: true,
        index: true,
    },
    color: {
        type: String,
        required: true,
        index: true,
    },
    fuel: {
        type: String,
        require: true,
        index: true
    },
    hp: {
        type: String,
        required: true,
        index: true,
    },
    torque: {
        type: String,
        required: true,
        index: true,
    },
    transmission: {
        type: String,
        required: true,
        index: true,
    },
    gears: {
        type: String,
        required: true,
        index: true,
    },
    drivetrain: {
        type: String,
        required: true,
        index: true,
    },
    discription: {
        type: String,
        require: true,
        index: true
    },
    image: {
        type: String,
        required: true,
        index: true,
    },
}, { timestamps: true })

const data = model('data', carsDataSchema);
module.exports = data;