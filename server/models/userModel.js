const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    pipeline: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pipeline',
      required: false, // Allow null or undefined
    }],
    // subpipeline: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'SubPipeline',
    //   required: false, // Allow null or undefined
    // },
    email: { type: String, required: true, unique: true },
    password: { type: String, default: null },
    image: { type: String },
    role: { type: String, required: true },
    // branch: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'Branch',
    //   required: false, 
    // },
    branch: {
      type: String,
      
    },
    permissions: [{ type: String }],
    verified: { type: Boolean, default: false },
    delstatus: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);
module.exports = User;
