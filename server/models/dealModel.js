const mongoose = require('mongoose');
const { Schema } = mongoose;

// Assuming User model is in the same directory; adjust the path as needed
const User = require('./userModel');
const DealActivityLog = require('./dealActivityLogModel');

const dealSchema = new Schema({
    is_transfer: {
        type: Boolean,
        default: false
    },
    client_id: {
        type: Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    lead_type: {
        type: String,
        required: true
    },
    pipeline_id: {
        type: String,
        required: true
    },
    // stage_id: {
    //     type: String,
    //     required: true
    // },
    sources: {
        type: String,
        required: true
    },
    products: {
        type: String,
        required: true
    },
    contract_stage: {
        type: String,
        required: true
    },
    labels: [{
        type: String, // Changed to String
        default: null
    }],
    status: {
        type: String,
        enum: ['Active', 'Inactive'], // Adjust based on possible values
        required: true
    },
    created_by: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lead_id: {
        type: Schema.Types.ObjectId,
        ref: 'Lead',

    },
    is_active: {
        type: Boolean,
        default: false
    },
    serviceCommission_id: {
        type: Schema.Types.ObjectId,
        ref: 'ServiceCommission',

    },
    activity_logs: [{
        type: Schema.Types.ObjectId,
        ref: 'DealActivityLog'
    }],
    date: {
        type: Date,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
    delstatus: { type: Boolean, default: false },

});

// Update timestamps before saving
dealSchema.pre('save', function (next) {
    if (this.isModified()) {
        this.updated_at = Date.now();
    }
    next();
});

module.exports = mongoose.model('Deal', dealSchema);
