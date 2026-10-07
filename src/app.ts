import express from 'express';
import helmet from 'helmet'
import { errorHandler } from './middleware/error-handler';
import { router } from './routes/chat.routes';

const app = express();
app.use(helmet());
app.use(express.json());

app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.use(router);
app.use(errorHandler);
export default app;