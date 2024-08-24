// models/leadModel.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Import the necessary models
const ActivityLog = require('./activityLogModel');  
const File = require('./fileModel');
const Branch = require('./branchModel'); // Import the Branch model
const Pipeline = require('./pipelineModel');
const LeadStage = require('./leadStageModel');
const LeadType = require('./leadTypeModel');
const Source = require('./sourceModel');

const LeadSchema = new Schema({ 
  client: { type: Schema.Types.ObjectId, ref: 'Client' },
  created_by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  selected_users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  pipeline_id: { type: Schema.Types.ObjectId, ref: 'Pipeline', required: true },
  subpipeline_id: { type: Schema.Types.ObjectId, ref: 'SubPipeline' },
  stage: { type: mongoose.Schema.Types.ObjectId, ref: 'LeadStage', required:true },
  lead_type: { type: Schema.Types.ObjectId, ref: 'LeadType', required: true },
  source: { type: Schema.Types.ObjectId, ref: 'Source', required: true },
  products: { type: String },
  notes: { type: String },
  description: { type: String },
  activity_logs: [{ type: Schema.Types.ObjectId, ref: 'ActivityLog' }],
  discussions: [{ type: Schema.Types.ObjectId, ref: 'LeadDiscussion' }],
  files: [{ type: Schema.Types.ObjectId, ref: 'File' }],
  labels: [{ type: String }],
  order: { type: String },
  is_active: { type: Boolean, default: true },
  is_converted: { type: Boolean, default: false },
  is_reject: { type: Boolean, default: false },
  date: { type: Date, default: Date.now },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  branch: { type: Schema.Types.ObjectId, ref: 'Branch' }, // New field to reference the Branch model
  // branch: { type: String }, 
  delstatus: { type: Boolean, default: false },

});

module.exports = mongoose.model('Lead', LeadSchema);
