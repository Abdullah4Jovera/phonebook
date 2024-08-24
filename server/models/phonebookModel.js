const mongoose = require('mongoose');

const phonebookSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        pipeline: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Pipeline',
            required: true
        },
        selected_users: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }], 
        number: {
            type: String,
            required: true
        },
        status: {
            type: String,
        },
        calstatus: {
            type: String,
            enum: ['Req to call', 'Interested', 'Rejected', 'Convert to Lead'], 
            default: 'Req to call' 
        },
        comments: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment',
        }]
    },
    {
        timestamps: true,
    }
);

const Phonebook = mongoose.model('Phonebook', phonebookSchema);
module.exports = Phonebook;
