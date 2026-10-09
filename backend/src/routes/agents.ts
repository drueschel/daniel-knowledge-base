import { Router } from 'express';
import { ActivityLogger } from '../services/ActivityLogger';

const router = Router();
const logger = new ActivityLogger();

router.get('/:id/activity', (req, res) => {
  const { id } = req.params;
  const logs = logger.getLogs(id);
  res.json(logs);
});

router.get('/activity', (req, res) => {
  const logs = logger.getLogs();
  res.json(logs);
});

export default router;
