
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

// Models
const User = require('./models/User');
const Movie = require('./models/Movie');
const MovieImage = require('./models/MovieImage');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));
app.use(express.static('uploads'));
app.set('view engine', 'ejs');

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/movies_db', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// File Upload Configuration
const upload = multer({ dest: 'uploads/' });

// Middleware for Authentication Check
function isAuthenticated(req, res, next) {
  if (req.session.user) return next();
  res.redirect('/login');
}

// Login Routes
// Login Route
app.get('/login', (req, res) => {
    res.render('login'); // Change to render EJS template
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log(`Username: ${username}, Password: ${password}`); // Log provided credentials
    try {
        const user = await User.findOne({ username, password });
        console.log('Found user:', user); // Log found user or null
        if (user) {
            req.session.user = user;
            res.redirect('/movies');
        } else {
            res.send('Invalid login');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});



// Logout Route
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// Insert Movie Details
app.get('/add-movie', isAuthenticated, (req, res) => {
  res.render('add-movie');
});

app.post('/add-movie', upload.single('image'), (req, res) => {
  const { name, director, producer, release_date, screens } = req.body;
  const image = req.file ? req.file.filename : null;

  const newMovie = new Movie({
    name,
    director,
    producer,
    release_date,
    image,
    screens: Array.isArray(screens) ? screens : [screens]
  });

  newMovie.save()
    .then(() => res.redirect('/movies'))
    .catch(err => res.send("Error saving movie details"));
});

// Multiple Image Upload for Movie
app.post('/add-movie-images/:movieId', upload.array('images', 5), (req, res) => {
  const { movieId } = req.params;
  const images = req.files.map(file => ({ movie_id: movieId, image: file.filename }));

  MovieImage.insertMany(images)
    .then(() => res.redirect('/movies'))
    .catch(err => res.send("Error uploading images"));
});

// Display Movies with Details
app.get('/movies', isAuthenticated, async (req, res) => {
    try {
        const movies = await Movie.find().populate('images'); // Ensure Movie model has an 'images' reference
        res.render('movies', { movies });
    } catch (error) {
        console.error('Error fetching movies:', error); // Log detailed error
        res.send("Error fetching movies");
    }
});


// Delete Movie
app.post('/delete-movie/:movieId', isAuthenticated, (req, res) => {
  const { movieId } = req.params;

  Movie.findByIdAndDelete(movieId)
    .then(() => res.redirect('/movies'))
    .catch(err => res.send("Error deleting movie"));
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
