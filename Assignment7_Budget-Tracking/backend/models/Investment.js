const mongoose = require('mongoose');

const InvestmentSchema = new mongoose.Schema({
  symbol: { type: String, required: true, uppercase: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  priceAtInvestment: { type: Number, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Investment', InvestmentSchema);
