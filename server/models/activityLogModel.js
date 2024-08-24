// models/activityLogModel.js
const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  log_type: String,
  remark: String,
  created_at: Date,
  updated_at: Date,
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);
