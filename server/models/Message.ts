import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  chat: mongoose.Types.ObjectId;
  sender: string; // Firebase UID
  text: string;
  createdAt: Date;
  readBy: string[]; // Array of user IDs who have read the message
}

const messageSchema = new Schema<IMessage>({
  chat: {
    type: Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  sender: {
    type: String, // Changed to String for Firebase UID
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  readBy: [{
    type: String,
    default: []
  }]
});

// Add indexes for better query performance
messageSchema.index({ chat: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ readBy: 1 });

// Ensure dates are always returned as ISO strings
messageSchema.set('toJSON', {
  transform: (doc, ret) => {
    if (ret.createdAt && ret.createdAt instanceof Date) {
      ret.createdAt = ret.createdAt.toISOString();
    }
    // Add sender information handling
    if (ret.sender && typeof ret.sender === 'string') {
      ret.sender = {
        uid: ret.sender
      };
    }
    return ret;
  }
});

export const Message = mongoose.model<IMessage>('Message', messageSchema); 