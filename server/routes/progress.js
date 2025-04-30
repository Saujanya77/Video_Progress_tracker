const express = require('express');
const router = express.Router();
const Progress = require('./progressModel'); // Import the Progress model

// Save progress
router.post('/save', async (req, res) => {
  const { progress } = req.body;

  try {
    // Check if there is existing progress data for the user (You can add a userID field if needed)
    let existingProgress = await Progress.findOne();

    if (existingProgress) {
      existingProgress.intervals = progress.intervals;
      existingProgress.lastTime = progress.lastTime;
      await existingProgress.save();
      res.status(200).json({ message: 'Progress updated successfully!' });
    } else {
      // If no existing progress data, create new entry
      const newProgress = new Progress(progress);
      await newProgress.save();
      res.status(201).json({ message: 'Progress saved successfully!' });
    }
  } catch (error) {
    console.error('Error saving progress:', error);
    res.status(500).json({ message: 'Failed to save progress' });
  }
});

// Load progress
router.get('/load', async (req, res) => {
  try {
    const progressData = await Progress.findOne();
    if (progressData) {
      res.status(200).json({ progress: progressData });
    } else {
      res.status(404).json({ message: 'No progress found' });
    }
  } catch (error) {
    console.error('Error loading progress:', error);
    res.status(500).json({ message: 'Failed to load progress' });
  }
});

module.exports = router;
