import { Request, Response } from 'express';
import { Chat, IChat } from '../models/Chat';
import { Message, IMessage } from '../models/Message';
import mongoose from 'mongoose';

interface AuthenticatedRequest extends Request {
  user: {
    _id: string;
  };
}

// Get all chats for a user
export const getUserChats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const chats = await Chat.find({ participants: req.user._id })
      .populate('participants', 'username avatar')
      .populate({
        path: 'messages',
        options: { sort: { createdAt: -1 }, limit: 1 }
      })
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// Get a specific chat with messages
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

    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
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