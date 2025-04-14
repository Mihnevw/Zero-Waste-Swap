import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import { getUserChats, getChat, createChat, sendMessage, markAsRead } from '../controllers/chatController';
import auth from '../middleware/auth';

interface AuthenticatedRequest extends Request {
  user: {
    _id: string;
    email: string;
    name: string;
  };
}

type AuthenticatedRequestHandler = RequestHandler;

const router = express.Router();

// Apply auth middleware to all chat routes
router.use(auth);

// Get all chats for the authenticated user
router.get('/', (async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await getUserChats(req, res);
  } catch (error) {
    next(error);
  }
}) as unknown as AuthenticatedRequestHandler);

// Get a specific chat
router.get('/:chatId', (async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await getChat(req, res);
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

// Send a message
router.post('/:chatId/messages', (async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await sendMessage(req, res);
  } catch (error) {
    next(error);
  }
}) as unknown as AuthenticatedRequestHandler);

// Mark messages as read
router.put('/:chatId/read', (async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await markAsRead(req, res);
  } catch (error) {
    next(error);
  }
}) as unknown as AuthenticatedRequestHandler);

export default router; 