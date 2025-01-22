// const mongoose = require("mongoose");

// // Define the schema for screenshots
// const screenshotSchema = new mongoose.Schema({
//   screenshot: {
//     type: String, // Base64-encoded image data
//     required: true,
//   },
//   timestamp: {
//     type: Date, // Timestamp when the screenshot was captured
//     default: Date.now,
//   },
// });

// // Create the Screenshot model
// const Screenshot = mongoose.model("Screenshot", screenshotSchema);

// module.exports = Screenshot;


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
