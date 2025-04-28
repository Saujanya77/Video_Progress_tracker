const express = require('express');
const router = express.Router();

let savedProgress = {}; // Store progress in memory

// Save progress
router.post('/save', (req, res) => {
    const { progress } = req.body;
    savedProgress = progress;
    res.status(200).json({ message: 'Progress saved successfully!' });
});

// Load progress
router.get('/load', (req, res) => {
    res.status(200).json({ progress: savedProgress });
});

module.exports = router;
