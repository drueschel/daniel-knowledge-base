import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import ingestRouter from './routes/ingest';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/ingest', ingestRouter);

// Healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'Agentic Backend is running.', version: '1.0.0' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`[Server] Agentic Backend listening on port ${PORT}`);
});
