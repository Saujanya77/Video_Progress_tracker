const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON data
app.use(express.json());

// Serve static files (HTML, CSS, JS, Video) from 'public' folder
app.use(express.static(path.join(__dirname, './public')));


// Dummy database in memory (reset on server restart)
let progressData = {};

// Routes
app.use('/api/progress', require('./routes/progress'));

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
