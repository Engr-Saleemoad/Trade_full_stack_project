import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const defaultPermissions = {
  users: { read: false, update: false, delete: false },
  deposits: { read: false, update: false, delete: false },
  payouts: { read: false, update: false, delete: false },
  investments: { read: false, update: false, delete: false },
  notices: { read: false, update: false, delete: false },
  settings: { read: false, update: false, delete: false },
};

const subAdminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    role: {
      type: String,
      default: 'sub-admin',
    },
    permissions: {
      type: Object,
      default: defaultPermissions,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
subAdminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare Password method
subAdminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const SubAdmin = mongoose.models.SubAdmin || mongoose.model('SubAdmin', subAdminSchema);

export default SubAdmin;
