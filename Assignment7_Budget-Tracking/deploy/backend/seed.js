require('dotenv').config();
const mongoose = require('mongoose');
const Transaction = require('./models/Transaction');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('MongoDB Connected for Seeding');
  
  // Clear existing data (optional, but good for a fresh start)
  await Transaction.deleteMany({});
  console.log('Cleared existing transactions');

  const seedTransactions = [
    { desc: 'Starbucks Coffee',   category: 'Dining',         catClass: 'cat-food',          date: '09/05/2026', amount: '−₹ 420',    type: 'debit',  confidence: 97, status: 'cleared' },
    { desc: 'DMart Groceries',    category: 'Groceries',      catClass: 'cat-groceries',     date: '08/05/2026', amount: '−₹ 2,340',  type: 'debit',  confidence: 99, status: 'cleared' },
    { desc: 'Salary Credit',      category: 'Income',         catClass: 'cat-rent',          date: '07/05/2026', amount: '+₹ 72,000', type: 'credit', confidence: 100, status: 'cleared' },
    { desc: 'Netflix Sub',        category: 'Entertainment',  catClass: 'cat-entertainment', date: '05/05/2026', amount: '−₹ 649',    type: 'debit',  confidence: 98, status: 'cleared' },
    { desc: 'Swiggy Order',       category: 'Dining',         catClass: 'cat-food',          date: '04/05/2026', amount: '−₹ 380',    type: 'debit',  confidence: 94, status: 'cleared' },
    { desc: 'Rapido Ride',        category: 'Transport',      catClass: 'cat-transport',     date: '03/05/2026', amount: '−₹ 85',     type: 'debit',  confidence: 88, status: 'cleared' },
    { desc: 'Electricity Bill',   category: 'Utilities',      catClass: 'cat-rent',          date: '02/05/2026', amount: '−₹ 1,820',  type: 'debit',  confidence: 96, status: 'flagged' },
    { desc: 'PhonePe Transfer',   category: 'Transfer',       catClass: 'cat-groceries',     date: '01/05/2026', amount: '−₹ 5,000',  type: 'debit',  confidence: 91, status: 'pending' },
    { desc: 'Amazon Shopping',    category: 'Shopping',       catClass: 'cat-entertainment', date: '30/04/2026', amount: '−₹ 3,499',  type: 'debit',  confidence: 95, status: 'cleared' },
    { desc: 'Zepto Groceries',    category: 'Groceries',      catClass: 'cat-groceries',     date: '29/04/2026', amount: '−₹ 1,120',  type: 'debit',  confidence: 99, status: 'cleared' },
    { desc: 'OLA Cab',            category: 'Transport',      catClass: 'cat-transport',     date: '28/04/2026', amount: '−₹ 220',    type: 'debit',  confidence: 93, status: 'cleared' },
    { desc: 'Gym Monthly',        category: 'Health',         catClass: 'cat-health',        date: '27/04/2026', amount: '−₹ 1,500',  type: 'debit',  confidence: 100,'status': 'cleared' },
    { desc: 'PVR Movies',         category: 'Entertainment',  catClass: 'cat-entertainment', date: '26/04/2026', amount: '−₹ 680',    type: 'debit',  confidence: 97, status: 'cleared' },
    { desc: 'Freelance Income',   category: 'Income',         catClass: 'cat-rent',          date: '25/04/2026', amount: '+₹ 8,000',  type: 'credit', confidence: 100,'status': 'cleared' },
    { desc: 'Rent April',         category: 'Rent',           catClass: 'cat-rent',          date: '01/04/2026', amount: '−₹ 14,000', type: 'debit',  confidence: 100,'status': 'cleared' }
  ];

  await Transaction.insertMany(seedTransactions);
  console.log('Database seeded successfully');
  
  process.exit();
})
.catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
