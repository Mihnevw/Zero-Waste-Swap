const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');
const mongoose = require('mongoose');
const { sendMessageNotification } = require('../services/emailService');
const admin = require('firebase-admin');

// Get all chats for a user
exports.getUserChats = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log('Fetching chats for user:', { userId, userEmail: req.user.email });
    
    const chats = await Chat.find({ 
      participants: userId 
    })
    .populate('participants', 'username email photoURL displayName')
    .populate({
      path: 'messages',
      populate: {
        path: 'sender',
        select: 'username email photoURL displayName _id'
      },
      options: { sort: { createdAt: -1 } }
    })
    .sort({ updatedAt: -1 });

    console.log('Found chats:', {
      count: chats.length,
      chats: chats.map(chat => ({
        id: chat._id,
        participants: chat.participants.map(p => ({
          id: p._id,
          username: p.username,
          email: p.email
        }))
      }))
    });
    
    const chatsWithUnread = chats.map(chat => {
      // Safely calculate unread count
      const unreadCount = chat.messages?.reduce((count, msg) => {
        // Check if message exists and has a sender
        if (msg && msg.sender && msg.sender._id) {
          return msg.sender._id.toString() !== userId.toString() && !msg.read ? count + 1 : count;
        }
        return count;
      }, 0) || 0;

      return {
        ...chat.toObject(),
        unreadCount
      };
    });

    res.json(chatsWithUnread);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ message: 'Failed to fetch chats', error: error.message });
  }
};

// Get messages for a specific chat
exports.getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;
    
    // Validate chatId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: 'Invalid chat ID format' });
    }
    
    console.log('Fetching messages:', { chatId, userId });

    // Find the chat and verify participant
    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId
    });

    if (!chat) {
      console.log('Chat not found or access denied:', { chatId, userId });
      return res.status(404).json({ message: 'Chat not found or access denied' });
    }

    // Fetch messages
    const messages = await Message.find({ chat: chatId })
      .sort({ createdAt: 1 });

    // Transform messages to include sender info
    const transformedMessages = await Promise.all(messages.map(async (msg) => {
      try {
        // Get sender info from Firebase
        const sender = await admin.auth().getUser(msg.sender);
        return {
          _id: msg._id.toString(),
          chat: msg.chat.toString(),
          text: msg.text,
          createdAt: msg.createdAt,
          read: msg.read,
          sender: {
            _id: sender.uid,
            name: sender.displayName || sender.email?.split('@')[0] || 'Unknown User',
            email: sender.email,
            photoURL: sender.photoURL
          }
        };
      } catch (error) {
        console.error('Error getting sender info:', error);
        return {
          _id: msg._id.toString(),
          chat: msg.chat.toString(),
          text: msg.text,
          createdAt: msg.createdAt,
          read: msg.read,
          sender: {
            _id: msg.sender,
            name: 'Unknown User',
            email: '',
            photoURL: null
          }
        };
      }
    }));

    console.log('Retrieved messages:', {
      chatId,
      messageCount: transformedMessages.length,
      sampleMessage: transformedMessages[0] ? {
        _id: transformedMessages[0]._id,
        sender: {
          _id: transformedMessages[0].sender._id,
          name: transformedMessages[0].sender.name
        }
      } : null
    });

    res.json(transformedMessages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Failed to fetch messages', error: error.message });
  }
};

// Create a new chat
exports.createChat = async (req, res) => {
  try {
    const { participantId } = req.body;
    const currentUserId = req.user._id;
    
    console.log('Creating chat:', { currentUserId, participantId });

    if (!participantId) {
      console.log('Missing participant ID');
      return res.status(400).json({ message: 'Participant ID is required' });
    }

    if (participantId === currentUserId) {
      console.log('Self-chat attempt');
      return res.status(400).json({ message: 'Cannot create chat with yourself' });
    }

    // Check if chat already exists
    const existingChat = await Chat.findOne({
      participants: { $all: [currentUserId, participantId] }
    });

    if (existingChat) {
      console.log('Found existing chat:', {
        chatId: existingChat._id,
        participants: existingChat.participants
      });
      return res.json(existingChat);
    }

    // Create new chat
    const chat = new Chat({
      participants: [currentUserId, participantId],
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await chat.save();

    console.log('Created new chat:', {
      chatId: chat._id,
      participants: chat.participants
    });

    res.status(201).json(chat);
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ message: 'Failed to create chat', error: error.message });
  }
};

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const chatId = req.params.chatId;
    const senderId = req.user._id;

    console.log('Sending message:', { chatId, senderId, textLength: text?.length });

    // Validate input
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Message text is required' });
    }

    // Find the chat
    const chat = await Chat.findById(chatId);
    if (!chat) {
      console.log('Chat not found:', chatId);
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Verify sender is a participant
    if (!chat.participants.includes(senderId)) {
      console.log('Sender not in chat participants:', { senderId, participants: chat.participants });
      return res.status(403).json({ message: 'Not authorized to send message in this chat' });
    }

    // Create the message
    const message = new Message({
      chat: chatId,
      sender: senderId,
      text: text.trim(),
      read: false
    });

    await message.save();

    // Update chat's last message and timestamp
    chat.lastMessage = message._id;
    chat.updatedAt = new Date();
    await chat.save();

    // Find the recipient (the other participant)
    const recipientId = chat.participants.find(id => id !== senderId);
    
    if (recipientId) {
      try {
        // Get recipient's info from Firebase
        const recipient = await admin.auth().getUser(recipientId);
        console.log('Found recipient:', { 
          uid: recipient.uid, 
          email: recipient.email,
          displayName: recipient.displayName 
        });

        if (recipient && recipient.email) {
          try {
            await sendMessageNotification(recipient.email, {
              senderName: req.user.displayName || req.user.email,
              messageText: text
            });
          } catch (emailError) {
            console.error('Error sending email notification:', emailError);
          }
        }
      } catch (firebaseError) {
        console.error('Error getting recipient info:', firebaseError);
      }
    }

    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Failed to send message', error: error.message });
  }
};

// Mark messages as read
exports.markMessagesAsRead = async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const userId = req.user.uid;

    console.log(`Marking messages as read in chat ${chatId} for user ${userId}`);

    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId
    });

    if (!chat) {
      console.log(`Chat ${chatId} not found for user ${userId}`);
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Update unread messages
    const result = await Message.updateMany(
      {
        chat: chatId,
        sender: { $ne: userId },
        read: false
      },
      { read: true }
    );

    console.log(`Marked ${result.modifiedCount} messages as read in chat ${chatId}`);

    // Get updated messages
    const messages = await Message.find({ chat: chatId })
      .populate('sender', 'username email photoURL')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Failed to mark messages as read' });
  }
};

// Get unread counts for all chats
exports.getUnreadCounts = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log('Fetching unread counts for user:', { userId, userEmail: req.user.email });
    
    // First verify the user has access to these chats
    const chats = await Chat.find({ 
      participants: userId 
    })
    .select('_id')
    .lean();
    
    console.log('Found chats:', {
      count: chats.length,
      chatIds: chats.map(c => c._id.toString())
    });

    if (!chats.length) {
      console.log('No chats found for user, returning empty counts');
      return res.json([]);
    }

    const unreadCounts = await Promise.all(
      chats.map(async (chat) => {
        try {
          console.log('Counting unread messages for chat:', chat._id.toString());
          
          const count = await Message.countDocuments({
            chat: chat._id,
            sender: { $ne: userId },
            read: false
          });
          
          console.log('Unread count for chat:', {
            chatId: chat._id.toString(),
            count
          });
          
          return {
            chatId: chat._id.toString(),
            unreadCount: count
          };
        } catch (err) {
          console.error('Error counting unread messages for chat:', {
            chatId: chat._id.toString(),
            error: err instanceof Error ? err.message : 'Unknown error'
          });
          // Return 0 for this chat but don't fail the whole request
          return {
            chatId: chat._id.toString(),
            unreadCount: 0
          };
        }
      })
    );

    console.log('Final unread counts:', {
      userId,
      counts: unreadCounts
    });

    res.json(unreadCounts);
  } catch (error) {
    console.error('Error in getUnreadCounts:', {
      userId: req.user._id,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack
      } : 'Unknown error'
    });
    
    res.status(500).json({ 
      message: 'Failed to fetch unread counts',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};