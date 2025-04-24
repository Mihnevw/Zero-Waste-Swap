import { Response } from 'express';
import { Chat, IChat, IChatLean, ChatLeanDocument } from '../models/Chat';
import { Message } from '../models/Message';
import mongoose from 'mongoose';
import { AuthenticatedRequest } from '../types/auth';
import User from '../models/User';
import { auth } from '../config/firebase-admin';
import { syncFirebaseUser } from './userController';

// Get all chats for a user with unread counts
export const getUserChats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('=== GET USER CHATS START ===');
    console.log('Request user data:', {
      _id: req.user._id,
      uid: req.user.uid,
      email: req.user.email,
      displayName: req.user.displayName
    });
    
    // First, get the chats
    const chats = await Chat.find({ 
      participants: { $in: [req.user.uid] }
    })
      .populate({
        path: 'lastMessage',
        select: 'text createdAt sender'
      })
      .lean()
      .sort({ updatedAt: -1 });

    console.log('Found chats with populated lastMessage:', {
      count: chats.length,
      chatIds: chats.map(c => c._id),
      participants: chats.map(c => c.participants),
      lastMessages: chats.map(c => c.lastMessage)
    });

    // Get all unique participant UIDs and ensure they are strings
    const participantUids = [...new Set(chats.flatMap(chat => 
      chat.participants.map(pid => String(pid))
    ))];
    console.log('Unique participant UIDs:', participantUids);

    // Get all users
    let users = await User.find({ uid: { $in: participantUids } })
      .select('uid email username displayName photoURL online')
      .lean();

    console.log('Found users in MongoDB:', {
      count: users.length,
      users: users.map(u => ({
        uid: u.uid,
        email: u.email,
        displayName: u.displayName,
        username: u.username,
        online: u.online
      }))
    });

    // Check for missing users and sync them from Firebase
    const missingUids = participantUids.filter(uid => 
      !users.some(user => user.uid === uid)
    );

    console.log('Missing UIDs:', {
      count: missingUids.length,
      uids: missingUids
    });

    if (missingUids.length > 0) {
      console.log('Missing users in MongoDB, syncing from Firebase:', missingUids);
      
      try {
        // Get missing users from Firebase and sync to MongoDB
        const firebaseUsers = await Promise.all(
          missingUids.map(async (uid) => {
            try {
              const user = await auth.getUser(uid);
              console.log('Retrieved user from Firebase:', {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName
              });
              return user;
            } catch (error) {
              console.error(`Failed to get user from Firebase: ${uid}`, {
                error: error instanceof Error ? error.message : 'Unknown error',
                code: error instanceof Error ? (error as any).code : 'unknown'
              });
              return null;
            }
          })
        );
        
        // Filter out failed Firebase user fetches
        const validFirebaseUsers = firebaseUsers.filter((user): user is any => user !== null);
        
        console.log('Valid Firebase users:', {
          count: validFirebaseUsers.length,
          users: validFirebaseUsers.map(u => ({
            uid: u.uid,
            email: u.email,
            displayName: u.displayName
          }))
        });
        
        if (validFirebaseUsers.length > 0) {
          // Sync valid users to MongoDB
          const syncedUsers = await Promise.all(
            validFirebaseUsers.map(async (user) => {
              try {
                const syncedUser = await syncFirebaseUser(user);
                console.log('Successfully synced user to MongoDB:', {
                  uid: syncedUser.uid,
                  email: syncedUser.email,
                  displayName: syncedUser.displayName
                });
                return syncedUser;
              } catch (error) {
                console.error(`Failed to sync user to MongoDB: ${user.uid}`, {
                  error: error instanceof Error ? error.message : 'Unknown error',
                  userData: {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName
                  }
                });
                return null;
              }
            })
          );
          
          // Filter out failed syncs
          const validSyncedUsers = syncedUsers.filter((user): user is any => user !== null);
          users = [...users, ...validSyncedUsers];
          
          console.log('Updated users array:', {
            count: users.length,
            users: users.map(u => ({
              uid: u.uid,
              email: u.email,
              displayName: u.displayName
            }))
          });
        }
      } catch (error) {
        console.error('Error during user sync process:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          missingUids
        });
      }
    }

    // Create a map of users by UID for quick lookup
    console.log('Creating user map from users:', {
      count: users.length,
      users: users.map(u => ({
        uid: u.uid,
        email: u.email,
        displayName: u.displayName
      }))
    });

    const userMap = new Map(users.map(user => [String(user.uid), user]));

    // Log the user map for debugging
    console.log('User map created:', {
      size: userMap.size,
      keys: Array.from(userMap.keys()),
      values: Array.from(userMap.values()).map(u => ({
        uid: u.uid,
        email: u.email,
        displayName: u.displayName
      }))
    });

    // Process chats to include user information
    const processedChats = chats.map(chat => {
      // Ensure all participants are strings
      const stringParticipants = chat.participants.map(pid => String(pid));
      const otherParticipantUid = stringParticipants.find(uid => uid !== String(req.user.uid));
      const otherUser = otherParticipantUid ? userMap.get(otherParticipantUid) : null;
      
      console.log('Processing chat:', {
        chatId: chat._id,
        participants: stringParticipants,
        otherParticipantUid,
        foundUser: otherUser ? {
          uid: otherUser.uid,
          displayName: otherUser.displayName,
          email: otherUser.email
        } : null,
        userMapHasOtherUser: otherParticipantUid ? userMap.has(otherParticipantUid) : false
      });

      // Get participant data with fallback for failed syncs
      const participants = stringParticipants.map(pid => {
        const user = userMap.get(pid);
        if (!user) {
          console.warn(`User data not found for participant: ${pid}`, {
            chatId: chat._id,
            reason: 'User sync failed or user deleted',
            userMapKeys: Array.from(userMap.keys()),
            userMapHasKey: userMap.has(pid)
          });
        }

        // Log the user data before processing
        console.log('Processing participant:', {
          pid,
          userData: user ? {
            uid: user.uid,
            username: user.username,
            displayName: user.displayName,
            email: user.email
          } : null,
          userMapHasKey: userMap.has(pid)
        });

        // Ensure all required fields are present and match the client's expected format
        const participantData = {
          uid: user?.uid || pid,
          username: user?.username || user?.displayName?.split(' ')[0] || 'user',
          email: user?.email || '',
          displayName: user?.displayName || user?.email?.split('@')[0] || 'Unknown User',
          photoURL: user?.photoURL || undefined,
          online: user?.online || false
        };

        // Log the processed participant data
        console.log('Processed participant data:', {
          pid,
          processedData: participantData,
          originalUser: user ? {
            uid: user.uid,
            username: user.username,
            displayName: user.displayName,
            email: user.email
          } : null
        });

        return participantData;
      });

      // Log the final chat data
      console.log('Final chat data:', {
        chatId: chat._id,
        participants: participants.map(p => ({
          uid: p.uid,
          username: p.username,
          displayName: p.displayName,
          email: p.email
        }))
      });

      // Get the last message if it exists
      const lastMessage = chat.lastMessage && typeof (chat.lastMessage as any).text === 'string' ? {
        text: (chat.lastMessage as any).text || '',
        createdAt: (chat.lastMessage as any).createdAt || new Date().toISOString()
      } : undefined;

      return {
        _id: chat._id,
        participants,
        lastMessage,
        updatedAt: chat.updatedAt
      };
    });

    // Log the final response
    console.log('Final response:', {
      chatCount: processedChats.length,
      participants: processedChats.map(chat => ({
        chatId: chat._id,
        participants: chat.participants.map(p => ({
          uid: p.uid,
          username: p.username,
          displayName: p.displayName
        }))
      }))
    });

    console.log('=== GET USER CHATS END ===');
    res.json(processedChats);
  } catch (error) {
    console.error('Error getting user chats:', error);
    res.status(500).json({ message: 'Error getting chats' });
  }
};

// Get a specific chat with messages and mark them as read
export const getChat = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      participants: req.user.uid
    })
      .populate('participants', 'uid username email displayName photoURL')
      .populate({
        path: 'messages',
        options: { sort: { createdAt: 1 } }
      });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Create a map of participant data for quick lookup
    const participantMap = new Map(
      (chat.participants as any[]).map(participant => [participant.uid, participant])
    );

    // Transform messages to include sender info from the participant map
    const transformedMessages = (chat.messages as any[]).map(message => ({
      ...message.toObject(),
      sender: participantMap.get(message.sender) || {
        uid: message.sender,
        username: 'Unknown User',
        displayName: 'Unknown User',
        email: '',
        photoURL: null
      }
    }));

    // Mark messages as read when chat is opened
    await Message.updateMany(
      {
        chat: chat._id,
        sender: { $ne: req.user.uid },
        readBy: { $ne: req.user.uid }
      },
      { $addToSet: { readBy: req.user.uid } }
    );

    // Return chat with transformed messages
    res.json({
      ...chat.toObject(),
      messages: transformedMessages
    });
  } catch (error) {
    console.error('Error in getChat:', error);
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
            sender: { $ne: req.user._id },
            readBy: { $ne: req.user._id }
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
    console.log('Creating chat with participants:', {
      currentUser: req.user.uid,
      participantId
    });

    // Check if chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [req.user.uid, participantId] }
    });

    if (chat) {
      console.log('Chat already exists:', chat._id);
      return res.json(chat);
    }

    // Get participant data from Firebase
    const participantData = await auth.getUser(participantId);
    console.log('Participant data from Firebase:', participantData);

    // Create or update participant in database
    let participant = await User.findOne({ uid: participantId });
    if (!participant) {
      participant = new User({
        uid: participantData.uid,
        email: participantData.email,
        username: participantData.displayName || participantData.email?.split('@')[0] || 'user',
        displayName: participantData.displayName || participantData.email?.split('@')[0] || 'User',
        photoURL: participantData.photoURL
      });
      await participant.save();
      console.log('Created new participant:', participant);
    }

    // Create new chat
    chat = new Chat({
      participants: [req.user.uid, participantId],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await chat.save();
    console.log('Created new chat:', chat._id);

    // Get current user data
    const currentUser = await User.findOne({ uid: req.user.uid });
    if (!currentUser) {
      console.log('Creating current user in database');
      const currentUserData = await auth.getUser(req.user.uid);
      const newCurrentUser = new User({
        uid: currentUserData.uid,
        email: currentUserData.email,
        username: currentUserData.displayName || currentUserData.email?.split('@')[0] || 'user',
        displayName: currentUserData.displayName || currentUserData.email?.split('@')[0] || 'User',
        photoURL: currentUserData.photoURL
      });
      await newCurrentUser.save();
    }

    // Get all participants data
    const participants = await User.find({ uid: { $in: [req.user.uid, participantId] } })
      .select('uid email username displayName photoURL')
      .lean();

    console.log('Chat participants:', participants);

    // Add participant data to the response
    const chatWithParticipants = {
      ...chat.toObject(),
      participants: participants
    };

    res.status(201).json(chatWithParticipants);
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ message: 'Failed to create chat',
      error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// Send a message
export const sendMessage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { chatId, text } = req.body;
    console.log('Sending message:', { chatId, text, sender: req.user.uid });

    // Verify chat exists and user is a participant
    const chat = await Chat.findOne({
      _id: chatId,
      participants: req.user.uid
    });

    if (!chat) {
      console.log('Chat not found or access denied:', {
        chatId,
        userId: req.user.uid,
        participants: [] as string[]
      });
      return res.status(404).json({ message: 'Chat not found or access denied' });
    }

    // Create new message
    const message = new Message({
      chat: chatId,
      sender: req.user.uid,
      text: text.trim(),
      readBy: [req.user.uid] // Mark as read by sender
    });

    console.log('Created message object:', {
      chatId: message.chat,
      sender: message.sender,
      text: message.text,
      readBy: message.readBy
    });

    // Save message
    await message.save();
    console.log('Message saved successfully:', message._id);

    // Add message to chat
    chat.messages.push(message._id);
    chat.updatedAt = new Date();
    await chat.save();
    console.log('Chat updated with new message');

    // Get sender information
    const sender = await User.findOne({ uid: req.user.uid })
      .select('uid email username displayName photoURL')
      .lean();

    if (!sender) {
      console.log('Sender not found in MongoDB, syncing from Firebase');
      const firebaseUser = await auth.getUser(req.user.uid);
      await syncFirebaseUser(firebaseUser);
    }

    // Prepare response with sender information
    const response = {
      ...message.toObject(),
      sender: sender ? {
        uid: sender.uid,
        displayName: sender.displayName,
        photoURL: sender.photoURL,
        initial: sender.displayName ? sender.displayName.charAt(0).toUpperCase() : '?'
      } : {
        uid: req.user.uid,
        displayName: 'Unknown User',
        initial: '?'
      }
    };

    console.log('Sending response:', response);
    res.status(201).json(response);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
};

// Mark messages as read
export const markMessagesAsRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    // Find all unread messages in the chat
    const unreadMessages = await Message.find({
      chat: chatId,
      readBy: { $ne: userId }
    });

    // Mark each message as read by the user
    const updatePromises = unreadMessages.map(message => 
      Message.findByIdAndUpdate(
        message._id,
        { $addToSet: { readBy: userId } },
        { new: true }
      )
    );

    await Promise.all(updatePromises);

    // Get updated unread count
    const unreadCount = await Message.countDocuments({
      chat: chatId,
      readBy: { $ne: userId }
    });

    res.json({ success: true, unreadCount });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Failed to mark messages as read' });
  }
};

// Get messages for a specific chat
export const getChatMessages = async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('=== GET CHAT MESSAGES START ===');
    const { chatId } = req.params;
    console.log('Request data:', {
      chatId,
      userId: req.user.uid,
      userEmail: req.user.email
    });
    
    // Verify user is part of the chat
    const chat = await Chat.findOne({
      _id: chatId,
      participants: req.user.uid
    }).lean();

    if (!chat) {
      console.log('Chat not found or access denied:', {
        chatId,
        userId: req.user.uid
      });
      return res.status(404).json({ message: 'Chat not found or access denied' });
    }

    console.log('Found chat:', {
      chatId: chat._id,
      participants: chat.participants,
      messageCount: chat.messages?.length
    });

    // Get messages
    const messages = await Message.find({ chat: chatId })
      .sort({ createdAt: 1 })
      .lean();

    console.log('Found messages:', {
      count: messages.length,
      messageIds: messages.map(m => m._id),
      senders: messages.map(m => m.sender)
    });

    // Get all unique sender UIDs
    const senderUids = [...new Set(messages.map(msg => msg.sender))];
    console.log('Unique sender UIDs:', senderUids);

    // Fetch all users from the database
    let users = await User.find({ uid: { $in: senderUids } })
      .select('uid email username displayName photoURL')
      .lean();

    console.log('Found users in MongoDB:', users.map(u => ({
      uid: u.uid,
      email: u.email,
      displayName: u.displayName,
      username: u.username
    })));

    // Check for missing users and sync them from Firebase
    const missingUids = senderUids.filter(uid => 
      !users.some(user => user.uid === uid)
    );

    if (missingUids.length > 0) {
      console.log('Missing users in MongoDB, syncing from Firebase:', missingUids);
      
      // Get missing users from Firebase and sync to MongoDB
      const firebaseUsers = await Promise.all(
        missingUids.map(uid => auth.getUser(uid))
      );
      
      console.log('Retrieved Firebase users:', firebaseUsers.map(u => ({
        uid: u.uid,
        email: u.email,
        displayName: u.displayName
      })));
      
      const syncedUsers = await Promise.all(
        firebaseUsers.map(user => syncFirebaseUser(user))
      );
      
      users = [...users, ...syncedUsers];
      console.log('Synced users from Firebase:', syncedUsers.map(u => ({
        uid: u.uid,
        email: u.email,
        displayName: u.displayName
      })));
    }

    // Create a map of users by UID for quick lookup
    const userMap = new Map(users.map(user => [String(user.uid), user]));

    // Process messages to include sender information
    const processedMessages = messages.map(message => {
      const sender = userMap.get(message.sender);
      console.log('Processing message:', {
        messageId: message._id,
        sender: message.sender,
        foundUser: sender ? {
          uid: sender.uid,
          displayName: sender.displayName,
          email: sender.email
        } : null
      });

      return {
        ...message,
        sender: sender ? {
          uid: sender.uid,
          displayName: sender.displayName,
          photoURL: sender.photoURL,
          initial: sender.displayName ? sender.displayName.charAt(0).toUpperCase() : '?'
        } : {
          uid: message.sender,
          displayName: 'Unknown User',
          initial: '?'
        }
      };
    });

    console.log('=== GET CHAT MESSAGES END ===');
    res.json(processedMessages);
  } catch (error) {
    console.error('Error getting chat messages:', error);
    res.status(500).json({ message: 'Error getting messages' });
  }
}; 