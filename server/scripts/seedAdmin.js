import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedProductionAdmin = async () => {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error('❌ Error: MONGO_URI environment variable is missing in .env');
    process.exit(1);
  }

  try {
    console.log('⏳ Connecting to MongoDB Atlas database...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB Atlas successfully.');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@globalprofithub.com';
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

    // Check if root admin already exists
    const existingAdmin = await User.findOne({
      $or: [{ email: adminEmail }, { username: adminUsername }],
    });

    if (existingAdmin) {
      console.log(`ℹ️ Admin user already exists: Username: ${existingAdmin.username} | Email: ${existingAdmin.email}`);
      console.log('✅ Seeding completed. Exiting script.');
      process.exit(0);
    }

    // Create Root Administrator
    const newAdmin = await User.create({
      firstName: 'Root',
      lastName: 'Administrator',
      username: adminUsername,
      email: adminEmail,
      password: adminPassword, // Password pre-save hook in User model hashes password using bcrypt
      phone: '0000000000',
      country: 'United States (+1)',
      role: 'admin',
      isSuspended: false,
      status: 'Active',
    });

    console.log('🎉 ROOT ADMINISTRATOR BOOTSTRAPPED SUCCESSFULLY!');
    console.log('--------------------------------------------------');
    console.log(`👤 Username: ${newAdmin.username}`);
    console.log(`✉️ Email:    ${newAdmin.email}`);
    console.log(`🔑 Password: ${adminPassword}`);
    console.log(`🛡️ Role:     ${newAdmin.role}`);
    console.log('--------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding root admin user:', error.message);
    process.exit(1);
  }
};

seedProductionAdmin();
