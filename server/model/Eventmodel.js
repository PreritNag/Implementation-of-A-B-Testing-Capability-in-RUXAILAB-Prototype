const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  experiment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Experiment',
    required: true,
    index: true
  },
  user: {
    type: String,
    required: true,
    index: true
  },
  variation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Experiment.variations'
  },
  type: {
    type: String,
    required: true,
    enum: ['pageview', 'click', 'conversion', 'custom']
  },
  data: mongoose.Schema.Types.Mixed, // Flexible event payload
  metadata: {
    ip: String,
    userAgent: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }
});

// Optimized indexes for analytics queries
eventSchema.index({ experiment: 1, type: 1, 'metadata.timestamp': 1 });
eventSchema.index({ variation: 1, type: 1 });

module.exports = mongoose.model('Event', eventSchema);