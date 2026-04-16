const express = require('express');
const router = express.Router();
const Investment = require('../models/Investment');

// GET all investments
router.get('/', async (req, res) => {
  try {
    const investments = await Investment.find().sort({ date: -1 });
    res.json(investments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// POST create new investment
router.post('/', async (req, res) => {
  try {
    const { symbol, amount, date, priceAtInvestment } = req.body;
    const newInvestment = new Investment({ symbol, amount, date, priceAtInvestment });
    const saved = await newInvestment.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
