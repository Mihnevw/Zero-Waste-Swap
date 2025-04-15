const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  participants: [{
    type: String,
    required: true
  }],
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: false
  },
  messages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
chatSchema.pre('save', function(next) {
  this.updatedAt = new Date();
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