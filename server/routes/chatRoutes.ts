import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import { getUserChats, getChat, createChat, sendMessage, markAsRead, getUnreadCounts } from '../controllers/chatController';
import auth from '../middleware/auth';
import { AuthenticatedRequest } from '../types/auth';

type AuthenticatedRequestHandler = RequestHandler;

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// Get all chats
router.get('/', (async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await getUserChats(req, res);
  } catch (error) {
    next(error);
  }
}) as unknown as AuthenticatedRequestHandler);

// Get unread message counts
router.get('/unread', (async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await getUnreadCounts(req, res);
  } catch (error) {
    next(error);
  }
}) as unknown as AuthenticatedRequestHandler);

// Create a new chat
router.post('/', (async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await createChat(req, res);
  } catch (error) {
    next(error);
  }
}) as unknown as AuthenticatedRequestHandler);

// Chat-specific routes
router.get('/:chatId', (async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await getChat(req, res);
  } catch (error) {
    next(error);
  }
}) as unknown as AuthenticatedRequestHandler);

router.post('/:chatId/messages', (async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await sendMessage(req, res);
  } catch (error) {
    next(error);
  }
}) as unknown as AuthenticatedRequestHandler);

router.put('/:chatId/read', (async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await markAsRead(req, res);
  } catch (error) {
    next(error);
  }
}) as unknown as AuthenticatedRequestHandler);

export default router; 