import { Router } from 'express';
import {
  createChat,
  getMessages,
  listUserChats,
  markMessageRead,
  sendMessage,
  updateLastSeen,
} from '../controllers/chat.controller.js';

export const router = Router();

router.post('/chat/create', createChat);
router.post('/chat/:chatId/message/send', sendMessage);
router.get('/chat/:chatId/messages', getMessages);
router.post('/chat/:chatId/message/:messageId/read', markMessageRead);
router.post('/chat/:chatId/lastseen', updateLastSeen);
router.get('/user/:userId/chats', listUserChats);
