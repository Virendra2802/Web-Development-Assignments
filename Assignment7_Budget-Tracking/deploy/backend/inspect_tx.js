require('dotenv').config();
const mongoose = require('mongoose');
const Transaction = require('./models/Transaction');

mongoose.connect(process.env.MONGO_URI)
.then(async () => {
    const txs = await Transaction.find({ category: /transport/i });
    console.log(JSON.stringify(txs, null, 2));
    process.exit();
});
