const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Service = require('./models/Service');

async function updatePrices() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const services = await Service.find();
    
    for (const service of services) {
        // Example logic: if price was 599 USD, set to 999 INR, etc.
        if (service.name === 'Home Deep Cleaning') {
            service.price = 999;
        } else if (service.name === 'Expert Electrician') {
            service.price = 299;
        } else if (service.name === 'Professional Plumber') {
            service.price = 199;
        } else if (service.name === 'AC Repair & Service') {
            service.price = 499;
        }
        await service.save();
    }

    console.log('All prices updated to INR values');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

updatePrices();
