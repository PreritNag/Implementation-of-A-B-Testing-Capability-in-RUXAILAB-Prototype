// Import required packages
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const assignmentRoutes = require("./routes/assignment");
const eventRoutes = require("./routes/events");
const experimentRoutes = require("./routes/experimentroutes");
const bodyParser = require("body-parser");

// Initialize Express app
const app = express();

// Middleware setup
app.use(cors()); // Allow frontend to connect
app.use(bodyParser.json()); // Parse JSON requests

// Connect to MongoDB (local/dev setup)
mongoose
  .connect("mongodb://127.0.0.1:27017/ruxailab-abtest", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

  app.use("/api/assignments", assignmentRoutes);
  app.use("/api/events", eventRoutes);
  app.use("/api/experiments", experimentRoutes);

// Basic error handling
app.use((err, req, res, next) => {
  console.error("Server error:", err.stack);
  res.status(500).json({ error: "Something broke!" });
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});