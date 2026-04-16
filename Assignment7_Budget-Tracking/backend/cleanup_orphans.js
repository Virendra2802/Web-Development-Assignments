const mongoose = require('mongoose');
require('dotenv').config();

async function cleanup() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');
    
    const result = await mongoose.connection.db.collection('transactions').deleteMany({
      $or: [
        { userId: null },
        { userId: { $exists: false } }
      ]
    });
    
    console.log(`Successfully cleaned up ${result.deletedCount} orphaned transactions.`);
    process.exit(0);
  } catch (err) {
    console.error('Cleanup Error:', err);
    process.exit(1);
  }
}

cleanup();
