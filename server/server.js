require('dotenv').config();  // Load environment variables from .env file
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

DB_URI= "mongodb+srv://dassaujanya1911:rIKoiFSnKRPttXl3@cluster0.c2gbbn3.mongodb.net/Progress?retryWrites=true&w=majority&appName=Cluster0" ;

// Log MongoDB URI to make sure it's being loaded correctly
console.log('MongoDB URI:', DB_URI);

// MongoDB Atlas connection using the URI from .env file
mongoose.connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Atlas connected'))
  .catch((error) => console.error('MongoDB connection error:', error));






// Middleware to parse JSON data
app.use(express.json());

// Serve static files (HTML, CSS, JS, Video) from 'public' folder
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/progress', require('./routes/progress'));

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
