const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  date: { type: Date, required: true },
  closingDate: { type: Date, required: true }, // Registration deadline
  location: String,
  capacity: { type: Number, required: true, min: 1 },
  price: { type: Number, default: 0 },
  image: String
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);