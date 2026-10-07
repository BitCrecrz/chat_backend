CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user1_id BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    user2_id BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL CONSTRAINT different_users CHECK (user1_id <> user2_id),
    CONSTRAINT ordered_users CHECK (user1_id < user2_id),
    CONSTRAINT unique_chat_pair UNIQUE (user1_id, user2_id)
);

CREATE INDEX IF NOT EXISTS idx_chats_user1 ON chats (user1_id);

CREATE INDEX IF NOT EXISTS idx_chats_user2 ON chats (user2_id);