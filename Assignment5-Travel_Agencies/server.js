const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname)));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vg_travels')
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// --- Schemas & Models ---
const subscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  subscribedAt: { type: Date, default: Date.now }
});
const Subscriber = mongoose.model('Subscriber', subscriberSchema);

const bookingSchema = new mongoose.Schema({
  destination: String,
  date: String,
  guests: Number,
  email: String,
  bookedAt: { type: Date, default: Date.now }
});
const Booking = mongoose.model('Booking', bookingSchema);
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

// --- Routes ---
app.post('/api/subscribe', async (req, res) => {
  const { email } = req.body;
  try {
    const existing = await Subscriber.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already subscribed' });
    }
    const newSubscriber = new Subscriber({ email });
    await newSubscriber.save();
    res.status(201).json({ message: 'Subscription successful!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/book', async (req, res) => {
  const { destination, date, guests, email } = req.body;
  try {
    const newBooking = new Booking({ destination, date, guests, email });
    await newBooking.save();
    res.status(201).json({ message: 'Booking confirmed! We will contact you shortly.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error during booking' });
  }
});

// --- Auth Routes ---
app.post('/api/signup', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'Account created successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error during signup' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Login successful!', token, user: { name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: 'Error during login' });
  }
});

// Fallback to index.html for unknown routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
