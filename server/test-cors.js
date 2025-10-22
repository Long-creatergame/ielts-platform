// Test CORS endpoint
const express = require('express');
const app = express();

// CORS Middleware - Allow all origins
app.use((req, res, next) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
});

app.get('/test-cors', (req, res) => {
  res.json({ message: 'CORS test successful', origin: req.headers.origin });
});

app.listen(3000, () => {
  console.log('CORS test server running on port 3000');
});
