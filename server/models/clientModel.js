const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String,  },
    password: { type: String, default: null },
    phone: { type: String, required: true , unique: true, },
    otp: { type: String, default: null },
    otpExpiration: { type: Date, default: null }, 
    verified: { type: Boolean, default: false },
    resetToken: { type: String, default: null }, 
    resetTokenExpiration: { type: Date, default: null }, 
    googleId: { type: String, unique: true, sparse: true }, 
    delStatus: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    delstatus: { type: Boolean, default: false },

});

module.exports = mongoose.model('Client', ClientSchema);
