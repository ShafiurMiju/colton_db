const express = require("express");
const Screenshot = require("../models/Screenshots");
const router = express.Router();

// POST: Save a screenshot to the database
router.post("/", async (req, res) => {
  try {
    const { screenshot, timestamp } = req.body;

    if (!screenshot) {
      return res.status(400).json({ error: "Screenshot data is required." });
    }

    const newScreenshot = new Screenshot({ screenshot, timestamp });
    await newScreenshot.save();

    console.log("SS Success")


    res.status(201).json({ message: "Screenshot saved successfully." });
  } catch (error) {
    console.error("Error saving screenshot:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// GET: Retrieve all screenshots
router.get("/", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  try {
    const screenshots = await Screenshot.aggregate([
      { $sort: { timestamp: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]).option({ allowDiskUse: true });

    res.status(200).json(screenshots);
  } catch (error) {
    console.error("Error fetching screenshots:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
