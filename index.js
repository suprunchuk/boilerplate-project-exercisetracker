require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

// In-memory data structures
const users = [];
const exercises = [];

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// Create a new user
app.post('/api/users', (req, res) => {
  const { username } = req.body;
  const newUser = { username, _id: Date.now().toString() };
  users.push(newUser);
  res.json(newUser);
});

// Get all users
app.get('/api/users', (req, res) => {
  res.json(users);
});

// Add exercises
app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;

  const user = users.find(user => user._id === _id);
  if (!user) {
    return res.status(400).json('User not found');
  }

  const exercise = {
    userId: _id,
    description,
    duration: parseInt(duration),
    date: date ? new Date(date).toDateString() : new Date().toDateString()
  };
  exercises.push(exercise);

  res.json({
    username: user.username,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date,
    _id: user._id
  });
});

// Get user exercise log
app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  const user = users.find(user => user._id === _id);
  if (!user) {
    return res.status(400).json('User not found');
  }

  let log = exercises.filter(ex => ex.userId === _id);

  if (from) {
    const fromDate = new Date(from).getTime();
    log = log.filter(ex => new Date(ex.date).getTime() >= fromDate);
  }

  if (to) {
    const toDate = new Date(to).getTime();
    log = log.filter(ex => new Date(ex.date).getTime() <= toDate);
  }

  if (limit) {
    log = log.slice(0, parseInt(limit));
  }

  res.json({
    username: user.username,
    count: log.length,
    _id: user._id,
    log: log.map(({ description, duration, date }) => ({
      description,
      duration,
      date
    }))
  });
});

// Start server
const listener = app.listen(port, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});