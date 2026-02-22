const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  content: { type: String, required: true, maxlength: 1000 },
  isFiltered: { type: Boolean, default: false },
  filterReason: { type: String, default: null },
  type: { type: String, enum: ['user', 'system'], default: 'user' }
}, { timestamps: true });

messageSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
