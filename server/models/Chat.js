const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  participants: [{
    type: String, // Using Firebase UID
    required: true
  }],
  messages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  createdAt: {
    type: String,
    default: () => new Date().toISOString()
  },
  updatedAt: {
    type: String,
    default: () => new Date().toISOString()
  }
});

// Update timestamps before saving
chatSchema.pre('save', function(next) {
  this.updatedAt = new Date().toISOString();
  next();
});

// Ensure dates are always returned as ISO strings
chatSchema.set('toJSON', {
  transform: (doc, ret) => {
    if (ret.createdAt && ret.createdAt instanceof Date) {
      ret.createdAt = ret.createdAt.toISOString();
    }
    if (ret.updatedAt && ret.updatedAt instanceof Date) {
      ret.updatedAt = ret.updatedAt.toISOString();
    }
    return ret;
  }
});

// Virtual for unread count
chatSchema.virtual('unreadCount').get(function() {
  if (!this.messages) return 0;
  return this.messages.filter(msg => !msg.read).length;
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat; 