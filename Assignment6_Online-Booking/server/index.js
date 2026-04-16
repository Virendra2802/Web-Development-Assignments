require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const Service = require('./models/Service');
const Booking = require('./models/Booking');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    seedServices();
  })
  .catch(err => console.error('Could not connect to MongoDB:', err));

// Seeding Initial Services
async function seedServices() {
  const count = await Service.countDocuments();
  if (count === 0) {
    const defaultServices = [
      { name: 'Expert Electrician', category: 'Electrician', description: 'Complete home wiring and repair experts.', price: 299, icon: 'zap' },
      { name: 'Professional Plumber', category: 'Plumber', description: 'Fixing leaks and plumbing installations.', price: 199, icon: 'droplet' },
      { name: 'Home Deep Cleaning', category: 'Cleaner', description: 'Professional sanitization and cleaning.', price: 999, icon: 'sparkles' },
      { name: 'AC Repair & Service', category: 'AC repair technician', description: 'Gas refill and general AC maintenance.', price: 499, icon: 'air-vent' }
    ];
    await Service.insertMany(defaultServices);
    console.log('Services seeded successfully');
  }
}

// Routes
app.get('/api/services', async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const booking = new Booking(req.body);
    const newBooking = await booking.save();
    res.status(201).json(newBooking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find().populate('serviceId');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Serve frontend for all other routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
