// models/sourceModel.js

const mongoose = require('mongoose');

// Define the Source Schema
const sourceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  lead_type_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LeadType', // Reference to the LeadType model
    required: true,
  },
  created_by: {
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

// Pre-save hook to update `updated_at` field before saving
sourceSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Create and export the Source model
const Source = mongoose.model('Source', sourceSchema);
module.exports = Source;
