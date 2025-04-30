const mongoose = require('mongoose');

// Define a schema for storing video progress
const progressSchema = new mongoose.Schema({
  intervals: [{
    start: Number,
    end: Number
  }],
  lastTime: Number
});

// Create a model for progress
const Progress = mongoose.model('Progress', progressSchema);

module.exports = Progress;
