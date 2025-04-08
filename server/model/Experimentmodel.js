const mongoose = require('mongoose');

const variationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  weight: { 
    type: Number, 
    default: 50,
    min: 1,
    max: 100 
  },
  config: { type: mongoose.Schema.Types.Mixed }, // Flexible UI config storage
  isControl: { type: Boolean, default: false }
}, { _id: true }); // Ensure variations have IDs

const experimentSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    index: true 
  },
  status: {
    type: String,
    enum: ['draft', 'running', 'paused', 'completed'],
    default: 'draft'
  },
  metrics: [{  // KPIs to track
    name: String,
    goal: { type: String, enum: ['increase', 'decrease'] }
  }],
  segments: {  // Targeting rules
    deviceTypes: [String],
    userGroups: [String]
  },
  variations: [variationSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  startedAt: Date,
  completedAt: Date
}, { timestamps: true });

// Index for faster querying
experimentSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Experiment', experimentSchema);