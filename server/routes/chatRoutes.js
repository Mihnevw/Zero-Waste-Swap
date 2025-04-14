const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middleware/auth');

// Apply auth middleware to all chat routes
router.use(auth);

// Get all chats for the authenticated user
router.get('/', chatController.getUserChats);

// Get a specific chat and its messages
router.get('/:chatId', chatController.getChatMessages);

// Get messages for a specific chat
router.get('/:chatId/messages', chatController.getChatMessages);

// Create a new chat
router.post('/', chatController.createChat);

// Send a message
router.post('/:chatId/messages', chatController.sendMessage);

// Mark messages as read
router.put('/:chatId/read', chatController.markMessagesAsRead);

module.exports = router; 