import dotenv from 'dotenv';
dotenv.config(); // MUST BE FIRST

import express from 'express';
import cors from 'cors';
import ingestRouter from './routes/ingest';
import agentsRouter from './routes/agents';
import studioRouter from './routes/studio';
import contentRouter from './routes/content';
import knowledgeRouter from './routes/knowledge';
import activityRouter from './routes/activity';

const app = express();
app.use(cors());
app.use(express.json());

import path from 'path';

// Serve audio files statically
app.use('/audio', express.static(path.join(__dirname, '..', 'data', 'audio')));
app.use('/outputs', express.static(path.join(__dirname, '..', 'public', 'outputs')));

// Routes
app.use('/api/ingest', ingestRouter);
app.use('/api/agents', agentsRouter);
app.use('/api/studio', studioRouter);
app.use('/api/content', contentRouter);
app.use('/api/knowledge', knowledgeRouter);
app.use('/api/activity', activityRouter);

import employeesRouter from './routes/employees';
app.use('/api/employees', employeesRouter);

// Healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'Agentic Backend is running.', version: '1.0.0' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`[Server] Agentic Backend listening on port ${PORT}`);
});
