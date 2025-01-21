const mongoose = require("mongoose");

// Define the schema for screenshots
const screenshotSchema = new mongoose.Schema({
  screenshot: {
    type: String, // Base64-encoded image data
    required: true,
  },
  timestamp: {
    type: Date, // Timestamp when the screenshot was captured
    default: Date.now,
  },
});

// Create the Screenshot model
const Screenshot = mongoose.model("Screenshot", screenshotSchema);

module.exports = Screenshot;
