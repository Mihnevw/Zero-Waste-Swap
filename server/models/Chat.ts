import mongoose, { Document, Schema } from 'mongoose';

interface IMessage {
  _id: mongoose.Types.ObjectId;
  text: string;
  createdAt: string | Date;
  sender: string;
}

export interface IChat extends Document {
  _id: mongoose.Types.ObjectId;
  participants: string[]; // Firebase UIDs
  messages: mongoose.Types.ObjectId[];
  lastMessage?: mongoose.Types.ObjectId | IMessage;
  createdAt: Date;
  updatedAt: Date;
}

export interface IChatLean {
  _id: mongoose.Types.ObjectId;
  participants: string[];
  messages: mongoose.Types.ObjectId[];
  lastMessage?: mongoose.Types.ObjectId | IMessage;
  createdAt: Date;
  updatedAt: Date;
}

export type ChatDocument = IChat & Document;
export type ChatLeanDocument = IChatLean & { _id: mongoose.Types.ObjectId };

const chatSchema = new Schema<IChat>({
  participants: [{
    type: String, // Changed to String for Firebase UIDs
    required: true
  }],
  messages: [{
    type: Schema.Types.ObjectId,
    ref: 'Message'
  }],
  lastMessage: {
    type: Schema.Types.ObjectId,
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

export const Chat = mongoose.model<IChat>('Chat', chatSchema); 