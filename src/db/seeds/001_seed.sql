INSERT INTO
    users (name, email)
VALUES (
        'Pankaj',
        'pankaj@example.com'
    ),
    ('Rahul', 'rahul@example.com'),
    ('Amit', 'amit@example.com'),
    ('Priya', 'priya@example.com'),
    ('Neha', 'neha@example.com')
ON CONFLICT (email) DO NOTHING;

INSERT INTO
    chats (user1_id, user2_id)
SELECT LEAST(u1.id, u2.id), GREATEST(u1.id, u2.id)
FROM users u1
    JOIN users u2 ON u1.email = 'pankaj@example.com'
    AND u2.email = 'rahul@example.com'
ON CONFLICT (user1_id, user2_id) DO NOTHING;

INSERT INTO
    chats (user1_id, user2_id)
SELECT LEAST(u1.id, u2.id), GREATEST(u1.id, u2.id)
FROM users u1
    JOIN users u2 ON u1.email = 'pankaj@example.com'
    AND u2.email = 'amit@example.com'
ON CONFLICT (user1_id, user2_id) DO NOTHING;

INSERT INTO
    chats (user1_id, user2_id)
SELECT LEAST(u1.id, u2.id), GREATEST(u1.id, u2.id)
FROM users u1
    JOIN users u2 ON u1.email = 'rahul@example.com'
    AND u2.email = 'priya@example.com'
ON CONFLICT (user1_id, user2_id) DO NOTHING;

SELECT id, name, email FROM users ORDER BY id;

SELECT
    id,
    user1_id,
    user2_id,
    created_at
FROM chats
ORDER BY created_at;