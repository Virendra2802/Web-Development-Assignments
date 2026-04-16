const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  desc: { type: String, required: true },
  category: { type: String, required: true },
  date: { type: String, required: true }, // Keeping as string to match current frontend formatting (e.g., '09/05/2026')
  amount: { type: String, required: true }, // Example: '−₹ 420'
  type: { type: String, enum: ['debit', 'credit'], required: true },
  confidence: { type: Number, required: true, default: 100 },
  status: { type: String, enum: ['cleared', 'pending', 'flagged'], default: 'pending' },
  catClass: { type: String, required: true } // CSS class map: 'cat-food', etc.
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
