import { FieldValue } from 'firebase-admin/firestore';
import { firestore, Timestamp } from '../config/firebase.js';
import type { Message } from '../types/chat.js';

const messagesCollection = (chatId: string) =>
  firestore.collection('chats').doc(chatId).collection('messages');

const lastSeenCollection = (chatId: string) =>
  firestore.collection('chats').doc(chatId).collection('lastSeen');

const readsCollection = (chatId: string, messageId: string) =>
  messagesCollection(chatId).doc(messageId).collection('reads');

export async function createMessage(chatId: string, senderId: number, text: string): Promise<Message> {
  const ref = messagesCollection(chatId).doc();
  const now = Timestamp.now();

  await ref.set({
    senderId,
    text,
    timestamp: now,
    createdAt: FieldValue.serverTimestamp(),
  });

  return {
    id: ref.id,
    chatId,
    senderId,
    text,
    timestamp: now.toDate(),
  };
}

export async function getMessages(chatId: string, limit: number): Promise<Message[]> {
  const snapshot = await messagesCollection(chatId)
    .orderBy('timestamp', 'desc')
    .limit(limit)
    .get();

  return snapshot.docs.reverse().map((doc) => {
    const data = doc.data();
    const timestamp = data.timestamp as Timestamp;

    return {
      id: doc.id,
      chatId,
      senderId: data.senderId as number,
      text: data.text as string,
      timestamp: timestamp.toDate(),
    };
  });
}

export async function markMessageRead(
  chatId: string,
  messageId: string,
  userId: number,
): Promise<void> {
  const messageRef = messagesCollection(chatId).doc(messageId);
  const message = await messageRef.get();

  if (!message.exists) {
    throw new Error('Message not found');
  }

  await readsCollection(chatId, messageId).doc(String(userId)).set({
    userId,
    readAt: FieldValue.serverTimestamp(),
  });
}

export async function updateLastSeen(
  chatId: string,
  userId: number,
  messageId: string,
): Promise<void> {
  const messageRef = messagesCollection(chatId).doc(messageId);
  const message = await messageRef.get();

  if (!message.exists) {
    throw new Error('Message not found');
  }

  await lastSeenCollection(chatId).doc(String(userId)).set({
    userId,
    messageId,
    updatedAt: FieldValue.serverTimestamp(),
  });
}
