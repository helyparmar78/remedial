// models/MovieImage.js
const mongoose = require('mongoose');

const movieImageSchema = new mongoose.Schema({
  movie_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' },
  image: String,
});

module.exports = mongoose.model('MovieImage', movieImageSchema);
