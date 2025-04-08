const express = require('express');
const router = express.Router();
const Event = require('../model/Eventmodel');
const UserAssignment = require('../model/UserAssignmentmodel');


router.post('/track', async (req, res) => {
  try {
    const { experimentId, userId, eventType, eventData } = req.body;

    // Verify assignment exists
    const assignment = await UserAssignment.findOne({
      experiment: experimentId,
      user: userId
    });

    if (!assignment) {
      return res.status(400).json({ error: 'User not assigned to experiment' });
    }

    // Create event
    const event = new Event({
      experiment: experimentId,
      user: userId,
      variation: assignment.variation,
      type: eventType,
      data: eventData,
      metadata: {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    await event.save();

    res.json({ success: true });

  } catch (err) {
    console.error('Tracking error:', err);
    res.status(500).json({ error: 'Failed to track event' });
  }
});
module.exports = router;