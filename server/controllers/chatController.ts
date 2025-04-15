import { Request, Response } from 'express';
import { Chat, IChat } from '../models/Chat';
import { Message, IMessage } from '../models/Message';
import mongoose from 'mongoose';
import { AuthenticatedRequest } from '../types/auth';

// Get all chats for a user with unread counts
export const getUserChats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('Getting chats for user:', req.user._id);
    const chats = await Chat.find({ participants: req.user._id })
      .populate('participants', 'username avatar')
      .populate({
        path: 'messages',
        options: { sort: { createdAt: -1 }, limit: 1 }
      })
      .sort({ updatedAt: -1 });

    // Get unread counts for each chat
    const chatsWithUnreadCounts = await Promise.all(
      chats.map(async (chat) => {
        const unreadCount = await Message.countDocuments({
          chat: chat._id,
          sender: { $ne: req.user._id },
          read: false
        });
        return {
          ...chat.toObject(),
          unreadCount
        };
      })
    );

    console.log('Returning chats with unread counts:', {
      userId: req.user._id,
      chatCount: chatsWithUnreadCounts.length
    });

    res.json(chatsWithUnreadCounts);
  } catch (error) {
    console.error('Error in getUserChats:', error);
    res.status(500).json({ message: (error as Error).message });
  }
};

// Get a specific chat with messages and mark them as read
export const getChat = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      participants: req.user._id
    })
      .populate('participants', 'username avatar')
      .populate({
        path: 'messages',
        populate: {
          path: 'sender',
          select: 'username avatar'
        },
        options: { sort: { createdAt: 1 } }
      });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Mark messages as read when chat is opened
    await Message.updateMany(
      {
        chat: chat._id,
        sender: { $ne: req.user._id },
        read: false
      },
      { read: true }
    );

    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// Get unread counts for all chats
export const getUnreadCounts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('Fetching unread counts for user:', {
      userId: req.user._id,
      userEmail: req.user.email
    });
    
    // First verify the user has access to these chats
    const chats = await Chat.find({ 
      participants: req.user._id 
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
            sender: { $ne: req.user._id }, // Use _id instead of uid
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
      userId: req.user._id,
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

// Create a new chat
export const createChat = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { participantId } = req.body;

    // Check if chat already exists
    let chat: IChat | null = await Chat.findOne({
      participants: { $all: [req.user._id, participantId] }
    });

    if (chat) {
      return res.json(chat);
    }

    chat = new Chat({
      participants: [new mongoose.Types.ObjectId(req.user._id), new mongoose.Types.ObjectId(participantId)]
    });

    await chat.save();
    await chat.populate('participants', 'username avatar');

    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// Send a message
export const sendMessage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { chatId, text } = req.body;

    const chat = await Chat.findOne({
      _id: chatId,
      participants: req.user._id
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const message = new Message({
      chat: new mongoose.Types.ObjectId(chatId),
      sender: new mongoose.Types.ObjectId(req.user._id),
      text
    });

    await message.save();
    chat.messages.push(message._id as unknown as mongoose.Types.ObjectId);
    await chat.save();

    await message.populate('sender', 'username avatar');

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// Mark messages as read
export const markAsRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { chatId } = req.params;

    await Message.updateMany(
      {
        chat: chatId,
        sender: { $ne: req.user._id },
        read: false
      },
      { read: true }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
}; 