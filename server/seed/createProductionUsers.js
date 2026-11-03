
require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

async function createProductionUsers() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is missing');
    }

    await connectDB();

    const users = [
      {
        name: 'Aarav Admin',
        email: 'admin@billing.com',
        password: 'Admin@123',
        phone: '9876543210',
        role: 'ADMIN'
      },
      {
        name: 'Meera Staff',
        email: 'staff@billing.com',
        password: 'Staff@123',
        phone: '9876543211',
        role: 'STAFF'
      }
    ];

    for (const userData of users) {
      const existing = await User.findOne({
        email: userData.email
      });

      if (existing) {
        console.log(`${userData.email} already exists. Skipping.`);
        continue;
      }

      await User.create(userData);
      console.log(`${userData.role} account created.`);
    }
  } catch (error) {
    console.error('Setup failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

createProductionUsers();
