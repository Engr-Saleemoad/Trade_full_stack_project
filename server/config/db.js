import mongoose from 'mongoose';

// Disable query buffering when disconnected to prevent 10s request hangs
mongoose.set('bufferCommands', false);

/**
 * Connects directly to MongoDB database using Mongoose.
 * Ensures persistent storage across server restarts with auto-reconnect safety.
 */
export const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/globalprofithub';
  try {
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️ Primary MongoDB Atlas Connection Notice (${error.message}). Attempting fallback to local MongoDB...`);
    try {
      const localConn = await mongoose.connect('mongodb://127.0.0.1:27017/globalprofithub', {
        serverSelectionTimeoutMS: 3000,
      });
      console.log(`✅ Fallback Local MongoDB Connected: ${localConn.connection.host}`);
    } catch (localErr) {
      console.error(`❌ All MongoDB Connections Failed. Please ensure your current IP address is whitelisted (0.0.0.0/0) in MongoDB Atlas or local MongoDB is running.`);
    }
  }
};

export default connectDB;
