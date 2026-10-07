import app from "./app";
import { env } from './config/env.js';
import { pool } from './db/client.js';

const server = app.listen(env.PORT, () => {
  console.log(`Chat API running on port ${env.PORT}`);
});

async function shutdown(signal: string) {
  console.log(`${signal} received. Shutting down...`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
