import { HttpError } from '../utils/http-error.js';
import * as chatRepository from '../repositories/chat.repository.js';
import * as firestoreService from './firestore.service.js';

export async function createOrGetChat(userAId: number, userBId: number) {
  if (userAId === userBId) {
    throw new HttpError(400, 'A chat requires two different users');
  }

  try {
    return await chatRepository.findOrCreateChat(userAId, userBId);
  } catch (error) {
    if (error instanceof Error && error.message === 'One or both users do not exist') {
      throw new HttpError(404, 'One or both users do not exist');
    }
    throw error;
  }
}

export async function sendMessage(chatId: string, senderId: number, text: string) {
  const chat = await chatRepository.findChatById(chatId);
  if (!chat) throw new HttpError(404, 'Chat not found');

  if (chat.user1Id !== senderId && chat.user2Id !== senderId) {
    throw new HttpError(403, 'User is not a member of this chat');
  }

  return firestoreService.createMessage(chatId, senderId, text);
}

export async function getMessages(chatId: string, limit: number) {
  const chat = await chatRepository.findChatById(chatId);
  if (!chat) throw new HttpError(404, 'Chat not found');
  return firestoreService.getMessages(chatId, limit);
}

export async function markRead(chatId: string, messageId: string, userId: number) {
  const chat = await chatRepository.findChatById(chatId);
  if (!chat) throw new HttpError(404, 'Chat not found');
  if (chat.user1Id !== userId && chat.user2Id !== userId) {
    throw new HttpError(403, 'User is not a member of this chat');
  }

  try {
    await firestoreService.markMessageRead(chatId, messageId, userId);
  } catch (error) {
    if (error instanceof Error && error.message === 'Message not found') {
      throw new HttpError(404, 'Message not found');
    }
    throw error;
  }
}

export async function updateLastSeen(chatId: string, userId: number, messageId: string) {
  const chat = await chatRepository.findChatById(chatId);
  if (!chat) throw new HttpError(404, 'Chat not found');
  if (chat.user1Id !== userId && chat.user2Id !== userId) {
    throw new HttpError(403, 'User is not a member of this chat');
  }

  try {
    await firestoreService.updateLastSeen(chatId, userId, messageId);
  } catch (error) {
    if (error instanceof Error && error.message === 'Message not found') {
      throw new HttpError(404, 'Message not found');
    }
    throw error;
  }
}

export async function getUserChats(userId: number) {
  if (!(await chatRepository.userExists(userId))) {
    throw new HttpError(404, 'User not found');
  }
  return chatRepository.listChatsForUser(userId);
}
