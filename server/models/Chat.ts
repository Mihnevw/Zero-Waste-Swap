import mongoose, { Document, Schema } from 'mongoose';

export interface IChat extends Document {
  participants: mongoose.Types.ObjectId[];
  messages: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const chatSchema = new Schema<IChat>({
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  messages: [{
    type: Schema.Types.ObjectId,
    ref: 'Message'
  }],
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

export const Chat = mongoose.model<IChat>('Chat', chatSchema); 