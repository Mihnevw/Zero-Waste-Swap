const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  sender: {
    type: String, // Changed to String to match Firebase UID
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: String, // Store as ISO string for consistency
    default: () => new Date().toISOString()
  },
  read: {
    type: Boolean,
    default: false
  }
});

// Add indexes for better query performance
messageSchema.index({ chat: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });

// Ensure dates are always returned as ISO strings
messageSchema.set('toJSON', {
  transform: (doc, ret) => {
    if (ret.createdAt && ret.createdAt instanceof Date) {
      ret.createdAt = ret.createdAt.toISOString();
    }
    // Add sender information handling
    if (ret.sender && typeof ret.sender === 'string') {
      ret.sender = {
        _id: ret.sender,
        uid: ret.sender
      };
    }
    return ret;
  }
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message; 