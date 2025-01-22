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

    console.log("SS Success");

    res.status(201).json({ message: "Screenshot saved successfully." });
  } catch (error) {
    console.error("Error saving screenshot:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// GET: Paginated screenshots
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 20, filterDate } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (filterDate) {
      const date = new Date(filterDate);

      // Start of the day in local time
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      // End of the day in local time
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      filter.timestamp = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }

    const screenshots = await Screenshot.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await Screenshot.countDocuments(filter);

    res.status(200).json({
      screenshots,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching screenshots:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});


  
  // DELETE: Delete a screenshot by ID
  router.delete("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const result = await Screenshot.findByIdAndDelete(id);
  
      if (!result) {
        return res.status(404).json({ error: "Screenshot not found." });
      }
  
      const totalCount = await Screenshot.countDocuments(); // Update total count
      res.status(200).json({
        message: "Screenshot deleted successfully.",
        totalCount,
      });
    } catch (error) {
      console.error("Error deleting screenshot:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  });


// DELETE: Delete all screenshots for a specific date
router.delete("/", async (req, res) => {
  try {
    const { date } = req.body;

    if (!date) {
      return res.status(400).json({ error: "Date is required" });
    }

    const startOfDay = new Date(date).setHours(0, 0, 0, 0);
    const endOfDay = new Date(date).setHours(23, 59, 59, 999);

    const result = await Screenshot.deleteMany({
      timestamp: { $gte: startOfDay, $lte: endOfDay },
    });

    res.status(200).json({
      message: `${result.deletedCount} screenshots deleted for the specified date.`,
    });
  } catch (error) {
    console.error("Error deleting screenshots by date:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});



module.exports = router;
