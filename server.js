// server.js THIS IS MY FINAL HOMEWORK SUBMISSION SERVER.JS
const express = require("express");
const path = require("path");
const app = express();

// Use express.json() middleware to parse JSON bodies.
app.use(express.json());

// Serve static files (HTML, CSS, client-side JavaScript) from the "public" directory.
app.use(express.static(path.join(__dirname, "public")));

// In-memory storage for each user’s attempt and for results.
const attempts = {}; // keyed by username
const results = []; // array of completed attempts for ranking

// POST /start (POST FUNCTIONS POST DATA TO THE SERVER)
// When the user starts, we generate a random delay (between 1 and 20 seconds)
// and record the server’s readyTime.
app.post("/start", (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: "Username is required." });
  }
  const startTime = Date.now();
  // Random delay between 1000 and 20000 ms.
  const delay = Math.floor(Math.random() * 19000) + 1000;
  const readyTime = startTime + delay;
  // Save the attempt state.
  attempts[username] = {
    username,
    startTime,
    delay,
    readyTime,
    clickCount: 0,
    earlyClicks: 0, // track number of early clicks
    reactionTime: null,
  };
  res.json({ delay });
});

// POST /click
// Called each time the user clicks the reaction button.
app.post("/click", (req, res) => {
  const { username } = req.body;
  if (!username || !attempts[username]) {
    return res
      .status(400)
      .json({ error: "Invalid username or no active attempt." });
  }
  const attempt = attempts[username];
  const clickTime = Date.now();

  // If a valid reaction time has already been recorded, ignore extra clicks.
  if (attempt.reactionTime !== null) {
    return res.json({
      message: "Already recorded reaction time.",
      reactionTime: attempt.reactionTime,
    });
  }

  // Increment click counter.
  attempt.clickCount++;


  // PENALTY !! PUNISH THEM~~!! 

  // Check if the click is too early (before readyTime)
  if (clickTime < attempt.readyTime) {
    // Increment the early click counter.
    attempt.earlyClicks++;

    // Determine penalty based on the number of early clicks.
    let penalty;
    if (attempt.earlyClicks === 1) {
      penalty = 2000;
    } else if (attempt.earlyClicks === 2) {
      penalty = 3000;
    } else {
      penalty = 5000; // third or any additional early click
    }
    // Extend the readyTime by the determined penalty.
    attempt.readyTime += penalty;

    return res.json({
      penalty: true,
      message: "Too early! Penalty applied.",
      newDelay: attempt.readyTime - clickTime,
    });
  }

  // Valid click: record reaction time (difference between click time and readyTime)
  const reactionTime = clickTime - attempt.readyTime;
  attempt.reactionTime = reactionTime;
  results.push({ username, reactionTime });
  return res.json({
    penalty: false,
    reactionTime,
    message: "Good reaction!",
  });
});

// GET /results (GET FUNCTIONS RETRIEVE DATA FROM THE SERVER)
// Returns the ranking of participants (lowest reaction time wins).
app.get("/results", (req, res) => {
  const validResults = results.filter((r) => r.reactionTime !== null);
  validResults.sort((a, b) => a.reactionTime - b.reactionTime);
  res.json({ results: validResults });
});

// Define the port (default to 3000 if not specified).
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
