import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import User from '../models/User.js';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const reseedAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/globalprofithub';
    console.log('[Reseed Admin] Connecting to MongoDB...');
    await mongoose.connect(mongoUri);

    // Remove any broken/incomplete admin entry
    await User.deleteMany({
      $or: [{ email: 'admin@globalprofithub.com' }, { username: 'admin' }],
    });

    const adminUser = new User({
      firstName: 'System',
      lastName: 'Administrator',
      username: 'admin',
      email: 'admin@globalprofithub.com',
      phone: '+1234567890',
      password: 'Admin@12345',
      role: 'admin',
      status: 'Active',
      mainBalance: 0,
      interestBalance: 0,
    });

    await adminUser.save();

    console.log('✅ Admin credentials created successfully!');
    console.log('Username: admin');
    console.log('Email: admin@globalprofithub.com');
    console.log('Password: Admin@12345');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to reseed admin:', err.message);
    process.exit(1);
  }
};

reseedAdmin();
