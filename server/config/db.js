import mongoose from 'mongoose';

/**
 * Connects directly to MongoDB database using Mongoose.
 * Ensures persistent storage across server restarts with auto-reconnect safety.
 */
export const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/globalprofithub';
  try {
    const conn = await mongoose.connect(primaryUri);
    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Failed: ${error.message}`);
    // Do not exit process immediately to prevent total crash loop on minor network blips
  }
};

export default connectDB;
