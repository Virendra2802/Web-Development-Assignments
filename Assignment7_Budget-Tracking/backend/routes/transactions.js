const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// @route   GET /api/transactions
// @desc    Get transactions for a specific user
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    console.log(`[GET TRANSACTIONS] Request for userId: ${userId}`);
    
    if (!userId) {
      console.warn('[GET TRANSACTIONS] Warning: No userId provided in query');
      return res.status(400).json({ msg: 'userId query param is required' });
    }

    const transactions = await Transaction.find({ userId }).sort({ createdAt: -1 });
    console.log(`[GET TRANSACTIONS] Found ${transactions.length} transactions for user ${userId}`);
    res.json(transactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/transactions
// @desc    Add a new transaction
router.post('/', async (req, res) => {
  const { userId, desc, category, date, amount, type, confidence, status, catClass } = req.body;

  if (!userId) return res.status(400).json({ msg: 'userId is required' });

  try {
    const newTransaction = new Transaction({
      userId,
      desc,
      category,
      date,
      amount,
      type,
      confidence,
      status,
      catClass
    });

    const transaction = await newTransaction.save();
    res.json(transaction);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/transactions/:id
// @desc    Delete a transaction
router.delete('/:id', async (req, res) => {
  try {
    const { userId } = req.query;
    console.log(`[DELETE TRANSACTION] Request for ID: ${req.params.id} by userId: ${userId}`);

    if (!userId) {
      console.warn('[DELETE TRANSACTION] Error: No userId provided');
      return res.status(400).json({ msg: 'userId is required' });
    }

    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      console.warn(`[DELETE TRANSACTION] Error: Transaction ${req.params.id} not found`);
      return res.status(404).json({ msg: 'Transaction not found' });
    }

    // Check if user owns the transaction
    if (transaction.userId.toString() !== userId) {
      console.warn(`[DELETE TRANSACTION] Error: Unauthorized. Tx Owner: ${transaction.userId}, Requestor: ${userId}`);
      return res.status(401).json({ msg: 'User not authorized to delete this transaction' });
    }

    await transaction.deleteOne();
    console.log(`[DELETE TRANSACTION] Success: Removed transaction ${req.params.id}`);
    res.json({ msg: 'Transaction removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
