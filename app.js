const express = require('express');
const path = require('path');
const compression = require('compression');
const app = express();

// Enable compression
app.use(compression());

// Serve static files from the Angular dist folder
app.use(express.static(path.join(__dirname, 'dist/portal-transuaminca/browser')));

// Handle all other routes by serving the index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/portal-transuaminca/browser/index.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});