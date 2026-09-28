import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, default: '' },
  priority: { type: String, enum: ['Normal', 'Important', 'Urgent'], default: 'Normal' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Notice', noticeSchema);
