const { model, Schema } = require('mongoose');
const Information = new Schema({
    firstName:{
        require: true,
        type: String,
        index: true,
    },
    lastName:{
        require: true,
        type: String,
        index: true
    },
    phNumber:{
        require: true,
        type: String,
        index: true
    },
    email:{
        require: true,
        type: String,
        index: true
    },
    adharCard: {
        type: String,
        require: true,
    },
    drivingLicence: {
        type: String,
        reuire: true,
    },
    startDate: {
        type: String,
        require: true,
    },
    endDate: {
        type: String,
        require: true,
    },
    availability: {
        type: Boolean,
        default: true,
        index: true,
    },
    verificationStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
        index: true,
    },
    adminComment: {
        type: String,
        default: '',
    },
    carId: {
        type: String,
        required: true,
        index: true,
    },
}, {timestamps: true} );

const customerInfo = model('customerInfo', Information);
module.exports = customerInfo;