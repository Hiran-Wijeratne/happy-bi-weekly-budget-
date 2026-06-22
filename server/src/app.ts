import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { router } from './routes';
import { errorHandler } from './middleware/error-handler';

export function createApp() {
  const app = express();

  app.use(helmet());
  const allowedOrigins = (process.env.CLIENT_URL ?? 'http://localhost:3000')
    .split(',')
    .map(s => s.trim());

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
  }));
  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/v1', router);
  app.use(errorHandler);

  return app;
}
