import { Router } from 'express';
import { ActivityLogger } from '../services/ActivityLogger';

const router = Router();
const logger = new ActivityLogger();

router.get('/', (req, res) => {
  const logs = logger.getLogs();
  res.json(logs);
});

router.delete('/', (req, res) => {
  logger.clearLogs();
  res.json({ success: true });
});

export default router;
