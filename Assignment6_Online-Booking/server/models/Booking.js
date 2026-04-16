const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  bookingDate: { type: String, required: true }, // Format: YYYY-MM-DD
  bookingTime: { type: String, required: true }, // e.g., 10:00 AM
  status: { type: String, default: 'Pending' }, // Pending, Confirmed, Completed, Cancelled
  totalPrice: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Booking', bookingSchema);
