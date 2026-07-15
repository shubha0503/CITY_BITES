import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { router } from './routes/index.js';

export const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.WEB_URL?.split(',') ?? true, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(pinoHttp());

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'citybites-api' }));
app.use('/api/v1', router);

