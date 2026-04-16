require('dotenv').config();
const mongoose = require('mongoose');
const Transaction = require('./models/Transaction');

mongoose.connect(process.env.MONGO_URI)
.then(async () => {
    const result = await Transaction.deleteMany({ amount: /50,000/ });
    console.log(`Deleted ${result.deletedCount} transactions.`);
    process.exit();
});
after cli