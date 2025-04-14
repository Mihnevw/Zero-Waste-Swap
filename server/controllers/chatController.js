const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');
const mongoose = require('mongoose');

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
    res.status(500).json({ message: 'Failed to fetch chats' });
  }
};

// Get messages for a specific chat
exports.getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id || req.user.uid;
    
    console.log('Fetching messages - Input:', { 
      chatId, 
      userId,
      userDetails: {
        _id: req.user._id,
        uid: req.user.uid,
        email: req.user.email
      }
    });

    // Validate chat ID format
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      console.log('Invalid chat ID format:', chatId);
      return res.status(400).json({ message: 'Invalid chat ID format' });
    }

    // First find the chat and verify participant
    const chat = await Chat.findOne({
      _id: chatId,
      participants: { $in: [userId] }
    }).populate('participants', 'username email photoURL displayName');

    if (!chat) {
      console.log('Chat access denied:', { 
        chatId, 
        userId,
        exists: await Chat.exists({ _id: chatId }),
        isParticipant: await Chat.exists({ _id: chatId, participants: userId })
      });
      return res.status(404).json({ message: 'Chat not found or access denied' });
    }

    // Fetch messages with populated sender info
    const messages = await Message.find({ chat: chatId })
      .populate({
        path: 'sender',
        model: 'User',
        select: 'username email photoURL displayName uid'
      })
      .sort({ createdAt: 1 });

    // Log message details for debugging
    console.log('Messages retrieved successfully:', {
      chatId,
      messageCount: messages.length,
      firstMessage: messages[0] ? {
        id: messages[0]._id,
        sender: messages[0].sender ? {
          id: messages[0].sender._id || messages[0].sender.uid,
          email: messages[0].sender.email
        } : 'No sender info',
        timestamp: messages[0].createdAt
      } : null,
      lastMessage: messages[messages.length - 1] ? {
        id: messages[messages.length - 1]._id,
        sender: messages[messages.length - 1].sender ? {
          id: messages[messages.length - 1].sender._id || messages[messages.length - 1].sender.uid,
          email: messages[messages.length - 1].sender.email
        } : 'No sender info',
        timestamp: messages[messages.length - 1].createdAt
      } : null,
      senderIds: messages.map(msg => msg.sender?._id || msg.sender?.uid).filter(Boolean)
    });

    // Transform messages to ensure consistent sender info
    const transformedMessages = messages.map(msg => {
      const messageObj = msg.toObject();
      // Create a default sender for messages with missing sender info
      const defaultSender = {
        _id: 'deleted-user',
        uid: 'deleted-user',
        username: 'Deleted User',
        email: '',
        photoURL: '',
        displayName: 'Deleted User'
      };

      // If sender is null or undefined, use the default sender
      const sender = msg.sender ? {
        ...msg.sender.toObject(),
        _id: msg.sender._id || msg.sender.uid,
        uid: msg.sender.uid || msg.sender._id,
        username: msg.sender.username || 'Unknown User',
        email: msg.sender.email || '',
        photoURL: msg.sender.photoURL || '',
        displayName: msg.sender.displayName || msg.sender.username || 'Unknown User'
      } : defaultSender;

      return {
        ...messageObj,
        sender,
        // Ensure other required fields have default values
        text: messageObj.text || '',
        createdAt: messageObj.createdAt || new Date().toISOString(),
        read: !!messageObj.read
      };
    });

    // Log the transformed messages for debugging
    console.log('Transformed messages:', {
      messageCount: transformedMessages.length,
      sampleMessage: transformedMessages[0] ? {
        id: transformedMessages[0]._id,
        sender: {
          id: transformedMessages[0].sender._id,
          username: transformedMessages[0].sender.username
        },
        hasRequiredFields: transformedMessages[0].sender && 
                         transformedMessages[0].text !== undefined && 
                         transformedMessages[0].createdAt
      } : null
    });

    res.json(transformedMessages);
  } catch (error) {
    console.error('Error in getChatMessages:', {
      error: error.message,
      stack: error.stack,
      chatId: req.params.chatId,
      userId: req.user?._id || req.user?.uid
    });
    res.status(500).json({ 
      message: 'Failed to fetch messages',
      details: error.message
    });
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

    if (participantId === currentUserId.toString()) {
      console.log('Self-chat attempt');
      return res.status(400).json({ message: 'Cannot create chat with yourself' });
    }

    // Check if chat already exists
    const existingChat = await Chat.findOne({
      participants: { $all: [currentUserId, participantId] }
    })
    .populate('participants', 'username email photoURL displayName');

    if (existingChat) {
      console.log('Found existing chat:', {
        chatId: existingChat._id,
        participants: existingChat.participants.map(p => ({
          id: p._id,
          username: p.username,
          email: p.email
        }))
      });
      return res.json(existingChat);
    }

    // Create new chat
    const chat = new Chat({
      participants: [currentUserId, participantId],
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    await chat.save();
    await chat.populate('participants', 'username email photoURL displayName');

    console.log('Created new chat:', {
      chatId: chat._id,
      participants: chat.participants.map(p => ({
        id: p._id,
        username: p.username,
        email: p.email
      }))
    });

    res.status(201).json(chat);
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ message: 'Failed to create chat' });
  }
};

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const chatId = req.params.chatId;
    const userId = req.user.uid || req.user._id; // Prefer Firebase UID

    console.log('Sending message - Input:', { 
      chatId, 
      userId,
      textLength: text?.length,
      userDetails: {
        _id: req.user._id,
        uid: req.user.uid,
        email: req.user.email
      }
    });

    // Validate chat ID format
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      console.log('Invalid chat ID format:', chatId);
      return res.status(400).json({ message: 'Invalid chat ID format' });
    }

    // Validate message text
    if (!text || typeof text !== 'string' || !text.trim()) {
      console.log('Invalid message text:', { text });
      return res.status(400).json({ message: 'Message text is required' });
    }

    // Find chat and verify participant
    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId
    });

    if (!chat) {
      console.log('Chat access denied:', { 
        chatId, 
        userId,
        exists: await Chat.exists({ _id: chatId }),
        isParticipant: await Chat.exists({ _id: chatId, participants: userId })
      });
      return res.status(404).json({ message: 'Chat not found or access denied' });
    }

    // Get user information
    const user = await User.findOne({ _id: userId });
    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    // Create and save the message
    const message = new Message({
      chat: chatId,
      sender: userId, // Using string ID
      text: text.trim(),
      read: false,
      createdAt: new Date().toISOString()
    });

    await message.save();

    // Transform message for response
    const transformedMessage = {
      ...message.toObject(),
      sender: {
        _id: user._id,
        uid: user._id, // Firebase UID is stored as _id
        username: user.username || 'Unknown User',
        email: user.email || '',
        photoURL: user.photoURL || '',
        displayName: user.displayName || user.username || 'Unknown User'
      }
    };

    // Update chat's last message and timestamp
    await Chat.findByIdAndUpdate(chatId, {
      $push: { messages: message._id },
      lastMessage: message._id,
      updatedAt: new Date().toISOString()
    });

    console.log('Message sent successfully:', {
      messageId: message._id,
      chatId,
      sender: {
        id: transformedMessage.sender._id,
        username: transformedMessage.sender.username
      },
      textLength: transformedMessage.text.length
    });

    res.status(201).json(transformedMessage);
  } catch (error) {
    console.error('Error in sendMessage:', {
      error: error.message,
      stack: error.stack,
      chatId: req.params.chatId,
      userId: req.user?.uid || req.user?._id
    });
    res.status(500).json({ 
      message: 'Failed to send message',
      details: error.message
    });
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