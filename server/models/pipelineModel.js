const mongoose = require('mongoose');

// Define the Pipeline Schema
const pipelineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
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
pipelineSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Create and export the Pipeline model
const Pipeline = mongoose.model('Pipeline', pipelineSchema);
module.exports = Pipeline;