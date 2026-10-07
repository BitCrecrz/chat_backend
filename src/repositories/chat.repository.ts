import type { PoolClient } from 'pg';
import { query, withTransaction } from '../db/client.js';
import type { Chat } from '../types/chat.js';

interface ChatRow {
  id: string;
  user1_id: string | number;
  user2_id: string | number;
  created_at: Date;
}

function mapUserId(id: string | number): number {
  const userId = Number(id);
  if (!Number.isSafeInteger(userId)) {
    throw new Error('Database user ID is outside the supported range');
  }
  return userId;
}

function mapChat(row: ChatRow): Chat {
  return {
    id: row.id,
    user1Id: mapUserId(row.user1_id),
    user2Id: mapUserId(row.user2_id),
    createdAt: row.created_at,
  };
}

export async function userExists(userId: number): Promise<boolean> {
  const result = await query('SELECT 1 FROM users WHERE id = $1', [userId]);
  return result.rowCount === 1;
}

export async function findChatById(chatId: string): Promise<Chat | null> {
  const result = await query<ChatRow>(
    'SELECT id, user1_id, user2_id, created_at FROM chats WHERE id = $1',
    [chatId],
  );
  return result.rows[0] ? mapChat(result.rows[0]) : null;
}

export async function findOrCreateChat(userAId: number, userBId: number): Promise<Chat> {
  const [user1Id, user2Id] = userAId < userBId ? [userAId, userBId] : [userBId, userAId];

  return withTransaction(async (client: PoolClient) => {
    const users = await client.query('SELECT id FROM users WHERE id = ANY($1::bigint[])', [[user1Id, user2Id]]);
    if (users.rowCount !== 2) {
      throw new Error('One or both users do not exist');
    }

    const result = await client.query<ChatRow>(
      `INSERT INTO chats (user1_id, user2_id)
       VALUES ($1, $2)
       ON CONFLICT (user1_id, user2_id)
       DO UPDATE SET user1_id = EXCLUDED.user1_id
       RETURNING id, user1_id, user2_id, created_at`,
      [user1Id, user2Id],
    );

    return mapChat(result.rows[0]);
  });
}

export async function listChatsForUser(userId: number): Promise<Chat[]> {
  const result = await query<ChatRow>(
    `SELECT id, user1_id, user2_id, created_at
     FROM chats
     WHERE user1_id = $1 OR user2_id = $1
     ORDER BY created_at DESC`,
    [userId],
  );
  return result.rows.map(mapChat);
}
