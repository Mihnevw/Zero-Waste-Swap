import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import { getUserChats, getChat, createChat, sendMessage, getUnreadCounts, markMessagesAsRead } from '../controllers/chatController';
import auth from '../middleware/auth';
import { AuthenticatedRequest } from '../types/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(auth);

// Get all chats for the authenticated user
router.get('/', (async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await getUserChats(req, res);
  } catch (error) {
    console.error('Error in chat routes:', error);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
}) as unknown as RequestHandler);

// Get unread message counts
router.get('/unread', (async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await getUnreadCounts(req, res);
  } catch (error) {
    console.error('Error getting unread counts:', error);
    res.status(500).json({ error: 'Failed to get unread counts' });
  }
}) as unknown as RequestHandler);

// Create a new chat
router.post('/', (async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const chat = await createChat(req, res);
    res.json(chat);
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ error: 'Failed to create chat' });
  }
}) as unknown as RequestHandler);

// Get messages for a specific chat
router.get('/:chatId', (async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const messages = await getChat(req, res);
    res.json(messages);
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
}) as unknown as RequestHandler);

// Send a message in a chat
router.post('/:chatId/messages', (async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const message = await sendMessage(req, res);
    res.json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
}) as unknown as RequestHandler);

// Mark messages as read in a chat
router.put('/:chatId/read', (async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await markMessagesAsRead(req, res);
    res.json(result);
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
}) as unknown as RequestHandler);

export default router; 