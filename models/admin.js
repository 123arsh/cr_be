const { model, Schema } = require('mongoose');
const adminSchema = new Schema({
    firstName: {
        type: String,
        require: true,
    },
    lastName: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        require: true,
        unique: true,
    },
    password: {
        type: String,
        require: true,
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

const admin = model('admin', adminSchema);
module.exports = admin;