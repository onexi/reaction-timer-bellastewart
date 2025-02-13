// server.js
const express = require('express');
const app = express();

// Use express.json() middleware to parse JSON bodies.
app.use(express.json());

// Serve static files (HTML, CSS, client-side JavaScript) from the "public" directory.
app.use(express.static('public'));

// In-memory storage for messages
let messages = [];

/**
 * GET /messages
 * Returns a JSON object containing all messages.
 */
app.get('/messages', (req, res) => {
  res.json({ messages });
});

/**
 * POST /messages
 * Expects a JSON payload with "username" and "message".
 * Adds the new message to the messages array.
 */
app.post('/messages', (req, res) => {
  const { username, message } = req.body;
  if (!username || !message) {
    return res.status(400).json({ error: 'Both username and message are required.' });
  }
  // Optionally, include a timestamp for each message.
  const newMessage = {
    username,
    message,
    timestamp: Date.now()
  };
  messages.push(newMessage);
  res.status(201).json({ success: true });
});

// Define the port (default to 3000 if not specified).
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
