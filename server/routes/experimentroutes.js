const express = require("express");
const router = express.Router();
const Experiment = require("../model/Experimentmodel");

// Create a new A/B test
router.post("/", async (req, res) => {
  try {
    const { name, variations } = req.body;

    // Basic validation
    if (!name) {
      return res.status(400).json({ error: "Experiment name is required" });
    }

    // Create experiment (with default variations if none provided)
    const experiment = new Experiment({
      name,
      variations: variations || [
        { name: "Control", weight: 50 },
        { name: "Variation A", weight: 50 },
      ],
    });

    // Save to DB
    await experiment.save();

    // Return success
    res.status(201).json({
      success: true,
      experiment,
    });
  } catch (err) {
    console.error("Error creating experiment:", err);
    res.status(500).json({ error: "Failed to create experiment" });
  }
});

// Get all experiments
router.get("/", async (req, res) => {
  try {
    const experiments = await Experiment.find().sort({ createdAt: -1 });
    res.json(experiments);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch experiments" });
  }
});

module.exports = router;