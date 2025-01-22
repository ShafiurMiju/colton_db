const express = require("express");
const History = require("../models/History");
const router = express.Router();

// Add browsing history
router.post("/", async (req, res) => {
  try {
    const { url, timestamp } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    const history = new History({ url, timestamp });
    await history.save();

    console.log("Success");

    res.status(201).json({ message: "History saved", history });
  } catch (error) {
    console.error("Error saving history:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET: Fetch paginated history with optional filter by date
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 50, filterDate } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (filterDate) {
      const date = new Date(filterDate);

      // Start and end of the day in local time
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      filter.timestamp = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }

    const history = await History.find(filter)
      .sort({ timestamp: -1 }) // Latest first
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await History.countDocuments(filter);

    res.status(200).json({
      history,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// DELETE: Delete a specific history item
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedHistory = await History.findByIdAndDelete(id);

    if (!deletedHistory) {
      return res.status(404).json({ error: "History item not found" });
    }

    res.status(200).json({ message: "History item deleted successfully" });
  } catch (error) {
    console.error("Error deleting history:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// DELETE: Delete all history for a specific date
router.delete("/", async (req, res) => {
  try {
    const { date } = req.body;

    if (!date) {
      return res.status(400).json({ error: "Date is required" });
    }

    const startOfDay = new Date(date).setHours(0, 0, 0, 0);
    const endOfDay = new Date(date).setHours(23, 59, 59, 999);

    await History.deleteMany({
      timestamp: { $gte: startOfDay, $lte: endOfDay },
    });

    res.status(200).json({ message: "All history for the specified date deleted" });
  } catch (error) {
    console.error("Error deleting history by date:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
