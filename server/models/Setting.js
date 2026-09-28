import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'global_settings',
      unique: true,
    },
    investmentIntervalMinutes: {
      type: Number,
      default: 1440, // Default: 1440 minutes = 24 hours
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Setting', settingSchema);
