// models/Movie.js
const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  name: { type: String, required: true },
  director: String,
  producer: String,
  release_date: Date,
  image: String,
  screens: [String],
});

module.exports = mongoose.model('Movie', movieSchema);
