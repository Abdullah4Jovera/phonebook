const mongoose = require('mongoose');

// Define the LeadType Schema
const leadTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  created_by:
  {
    type: String,
  },


  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
  delstatus: { type: Boolean, default: false },

});

// Pre-save hook to update updated_at field before saving
leadTypeSchema.pre('save', function (next) {
  this.updated_at = Date.now();
  next();
});

// Create and export the LeadType model
const LeadType = mongoose.model('LeadType', leadTypeSchema);
module.exports = LeadType;