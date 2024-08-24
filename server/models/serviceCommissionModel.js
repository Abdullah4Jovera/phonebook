const mongoose = require('mongoose');
const { Schema } = mongoose;

// Assuming Deal and User models are in the same directory; adjust the path as needed
const Deal = require('./dealModel');
const User = require('./userModel');

const serviceCommissionSchema = new Schema({
    deal_id: {
        type: Schema.Types.ObjectId,
        ref: 'Deal',
        required: true
    },
    finance_amount: {
        type: String,
    },
    bank_commission: {
        type: String,
    },
    customer_commission: {
        type: String,
    },
    with_vat_commission: {
        type: String,
    },
    without_vat_commission: {
        type: String,
    },
    hodsale: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    hodsalecommission: {
        type: String,
    },
    salemanager: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    salemanagercommission: {
        type: String,
    },
    coordinator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    coordinator_commission: {
        type: String,
    },
    team_leader: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    team_leader_commission: {
        type: String,
    },
    salesagent: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    team_leader_one: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    team_leader_one_commission: {
        type: String,
        default: "0"
    },
    sale_agent_one: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    sale_agent_one_commission: {
        type: String,
        default: "0"
    },
    salesagent_commission: {
        type: String,
        default: "0"
    },
    salemanagerref: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    salemanagerrefcommission: {
        type: String,
        default: "0"
    },
    agentref: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    agent_commission: {
        type: String,
        default: "0"
    },
    ts_hod: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    ts_hod_commision: {
        type: String,
        default: "0"
    },
    ts_team_leader: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    ts_team_leader_commission: {
        type: String,
        default: "0"
    },
    tsagent: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    tsagent_commission: {
        type: String,
        default: "0"
    },
    marketingmanager: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    marketingmanagercommission: {
        type: String,
        default: "0"
    },
    marketingagent: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    marketingagentcommission: {
        type: String,
        default: "0"
    },
    other_name: {
        type: String,
        default: null
    },
    other_name_commission: {
        type: String,
        default: "0"
    },
    broker_name: {
        type: String,
        default: null
    },
    broker_name_commission: {
        type: String,
        default: "0"
    },
    alondra: {
        type: String,
    },
    a_commission: {
        type: String,
        default: "0"
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

}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('ServiceCommission', serviceCommissionSchema);
