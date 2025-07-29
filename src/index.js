const express = require('express');
const app = express();
require("dotenv").config() ;

const PORT = process.env.PORT || 5000;

// This log will appear the moment the server file is loaded by Vercel
console.log('Server file has been loaded by Vercel.');

app.get('/', (req, res) => {
  // This log will appear only if a request successfully reaches this route
  console.log("Request successfully received for root route '/'.");
  res.status(200).send('<h1>Success! Your minimal backend is running on Vercel.</h1>');
});

app.get('/api/test', (req, res) => {
  // A second route for testing
  console.log("Request successfully received for '/api/test' route.");
  res.status(200).json({ message: 'The test API route is working!' });
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}. This log will NOT appear on Vercel.`);
});
