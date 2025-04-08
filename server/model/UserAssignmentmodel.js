const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  experiment: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Experiment',
    required: true,
    index: true 
  },
  user: {
    type: String, // Can be user ID or anonymous session ID
    required: true,
    index: true
  },
  variation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Experiment.variations',
    required: true
  },
  segment: {  // User properties at time of assignment
    device: String,
    location: String,
    isNewUser: Boolean
  },
  assignedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for fast lookups
assignmentSchema.index({ 
  experiment: 1, 
  user: 1 
}, { unique: true });

module.exports = mongoose.model('UserAssignment', assignmentSchema);