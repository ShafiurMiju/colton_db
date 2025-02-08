const mongoose = require("mongoose");

const screenshotSchema = new mongoose.Schema({
  screenshot: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true, // Add index for efficient sorting
  },
});

module.exports = mongoose.model("Screenshot", screenshotSchema);
