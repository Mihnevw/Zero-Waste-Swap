const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Import models after dotenv is loaded
const Chat = mongoose.model('Chat', new mongoose.Schema({
  participants: [{
    type: String,
    required: true
  }],
  messages: [{
    type: mongoose.Schema.Types.ObjectId,
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
}));

const Message = mongoose.model('Message', new mongoose.Schema({
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  sender: {
    type: String,
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
}));

const User = require('../models/User');
const { auth } = require('../config/firebase-admin');

async function migrateUserIds() {
  try {
    console.log('Starting user ID migration...');

    // Check environment variables
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Verify models are loaded
    if (!Chat || !Message || !User) {
      console.error('Models:', { 
        Chat: Chat ? 'loaded' : 'undefined',
        Message: Message ? 'loaded' : 'undefined',
        User: User ? 'loaded' : 'undefined'
      });
      throw new Error('One or more models failed to load');
    }

    // Get all users
    const users = await User.find().lean();
    console.log(`Found ${users.length} users`);

    if (users.length === 0) {
      throw new Error('No users found in the database');
    }

    // Create a map of MongoDB _ids to Firebase UIDs
    const idMap = new Map(users.map(user => [user._id.toString(), user.uid]));
    console.log('Created ID mapping');

    // Update Chat participants
    const chats = await Chat.find().lean();
    console.log(`Found ${chats.length} chats`);

    let updatedChats = 0;
    for (const chat of chats) {
      try {
        const oldParticipants = chat.participants;
        // No need to map participants as they are already Firebase UIDs
        console.log(`Chat ${chat._id} participants:`, oldParticipants);
        updatedChats++;
      } catch (error) {
        console.error(`Error processing chat ${chat._id}:`, error);
      }
    }
    console.log(`Processed ${updatedChats} chats`);

    // Update Message senders and readBy
    const messages = await Message.find().lean();
    console.log(`Found ${messages.length} messages`);

    let updatedMessages = 0;
    for (const message of messages) {
      try {
        const updates = {};
        let needsUpdate = false;

        // Log the current message data
        console.log(`Processing message ${message._id}:`, {
          sender: message.sender,
          readBy: message.readBy
        });

        // Check if sender is a Firebase UID
        if (message.sender && !message.sender.startsWith('TK')) {
          console.log(`Message ${message._id} has non-Firebase sender: ${message.sender}`);
        }

        // Check if readBy contains any non-Firebase UIDs
        if (message.readBy && message.readBy.length > 0) {
          const nonFirebaseUids = message.readBy.filter(pid => !pid.startsWith('TK'));
          if (nonFirebaseUids.length > 0) {
            console.log(`Message ${message._id} has non-Firebase readBy:`, nonFirebaseUids);
          }
        }

        // No updates needed as all IDs are already Firebase UIDs
        console.log(`No updates needed for message ${message._id}`);
      } catch (error) {
        console.error(`Error processing message ${message._id}:`, error);
      }
    }
    console.log(`Processed ${messages.length} messages`);

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the migration
migrateUserIds(); 