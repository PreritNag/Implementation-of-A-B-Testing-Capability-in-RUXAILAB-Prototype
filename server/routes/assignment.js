const express = require('express');
const router = express.Router();
const Experiment = require('../model/Experimentmodel');
const UserAssignment = require('../model/UserAssignmentmodel');


router.post('/assign', async (req, res) => {
  try {
    const { experimentId, userId, userSegment } = req.body;

    // Check if already assigned
    const existing = await UserAssignment.findOne({ 
      experiment: experimentId, 
      user: userId 
    });
    
    if (existing) {
      return res.json(existing);
    }

    // Get experiment with variations
    const experiment = await Experiment.findById(experimentId);
    if (!experiment) {
      return res.status(404).json({ error: 'Experiment not found' });
    }

    // Apply segmentation rules if any
    const isEligible = (segment, userSegment) => {
      if (!segment || !userSegment) return true;
      if (segment.deviceTypes && !segment.deviceTypes.includes(userSegment.device)) return false;
      if (segment.userGroups && !segment.userGroups.includes(userSegment.group)) return false;
      return true;
    };
    
    const eligibleVariations = experiment.variations.filter(() =>
      isEligible(experiment.segments, userSegment)
    );
    

    // Weighted random assignment
    const totalWeight = eligibleVariations.reduce((sum, v) => sum + v.weight, 0);
    let random = Math.random() * totalWeight;
    let selectedVariation;

    for (const variation of eligibleVariations) {
      if (random < variation.weight) {
        selectedVariation = variation;
        break;
      }
      random -= variation.weight;
    }

    // Record assignment
    const assignment = new UserAssignment({
      experiment: experimentId,
      user: userId,
      variation: selectedVariation._id,
      segment: userSegment
    });

    await assignment.save();

    res.json({
      variation: selectedVariation,
      assignmentId: assignment._id
    });

  } catch (err) {
    console.error('Assignment error:', err);
    res.status(500).json({ error: 'Failed to assign variation' });
  }
});
module.exports = router;