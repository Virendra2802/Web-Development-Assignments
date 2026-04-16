const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true }, // Electrician, Plumber, Cleaner, AC Repair
  description: { type: String, required: true },
  price: { type: Number, required: true },
  icon: { type: String }, // SVG path or Lucide icon name
  rating: { type: Number, default: 4.5 },
  reviews: { type: Number, default: 0 },
});

module.exports = mongoose.model('Service', serviceSchema);
