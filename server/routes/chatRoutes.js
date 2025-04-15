const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(auth);

// Get all chats
router.get('/', chatController.getUserChats);

// Get unread message counts
router.get('/unread', chatController.getUnreadCounts);

// Create a new chat
router.post('/', chatController.createChat);

// Chat-specific routes
router.get('/:chatId', chatController.getChatMessages);
router.post('/:chatId/messages', chatController.sendMessage);
router.put('/:chatId/read', chatController.markMessagesAsRead);

module.exports = router; 