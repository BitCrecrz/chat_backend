import type { Request, Response } from 'express';
import { z } from 'zod';
import * as chatService from '../services/chat.service.js';

const idSchema = z.coerce.number().int().positive().safe();

const createChatSchema = z.object({
  userAId: idSchema,
  userBId: idSchema,
});

const sendMessageSchema = z.object({
  senderId: idSchema,
  text: z.string().trim().min(1).max(5000),
});

const readSchema = z.object({ userId: idSchema });
const lastSeenSchema = z.object({ userId: idSchema, messageId: z.string().min(1) });

export async function createChat(req: Request, res: Response) {
  const { userAId, userBId } = createChatSchema.parse(req.body);
  const chat = await chatService.createOrGetChat(userAId, userBId);
  res.status(200).json({ chatId: chat.id });
}

export async function sendMessage(req: Request, res: Response) {
  const chatId = z.string().uuid().parse(req.params.chatId);
  const { senderId, text } = sendMessageSchema.parse(req.body);
  const message = await chatService.sendMessage(chatId, senderId, text);
  res.status(201).json(message);
}

export async function getMessages(req: Request, res: Response) {
  const chatId = z.string().uuid().parse(req.params.chatId);
  const limit = z.coerce.number().int().min(1).max(100).default(50).parse(req.query.limit);
  const messages = await chatService.getMessages(chatId, limit);
  res.json({ messages });
}

export async function markMessageRead(req: Request, res: Response) {
  const chatId = z.string().uuid().parse(req.params.chatId);
  const messageId = z.string().min(1).parse(req.params.messageId);
  const { userId } = readSchema.parse(req.body);
  await chatService.markRead(chatId, messageId, userId);
  res.status(204).send();
}

export async function updateLastSeen(req: Request, res: Response) {
  const chatId = z.string().uuid().parse(req.params.chatId);
  const { userId, messageId } = lastSeenSchema.parse(req.body);
  await chatService.updateLastSeen(chatId, userId, messageId);
  res.status(204).send();
}

export async function listUserChats(req: Request, res: Response) {
  const userId = idSchema.parse(req.params.userId);
  const chats = await chatService.getUserChats(userId);
  res.json({ chats });
}
