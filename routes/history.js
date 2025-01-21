const express = require('express');
const History = require('../models/History');
const router = express.Router();

// Add browsing history
router.post('/', async (req, res) => {
  try {
    const { url, timestamp } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const history = new History({ url, timestamp });
    await history.save();

    console.log("Success")

    res.status(201).json({ message: 'History saved', history });
  } catch (error) {
    console.error('Error saving history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all browsing history
router.get('/', async (req, res) => {
  try {
    const history = await History.find().sort({ timestamp: -1 });
    res.status(200).json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
