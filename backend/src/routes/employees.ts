import { Router } from 'express';
import { EmployeeService } from '../services/EmployeeService';

const router = Router();
const hr = new EmployeeService();

router.get('/', (req, res) => {
  res.json(hr.getAll());
});

router.put('/:id', (req, res) => {
  try {
    const updated = hr.update(req.params.id, req.body);
    res.json(updated);
  } catch (e: any) {
    res.status(404).json({ error: e.message });
  }
});

router.post('/:id/feedback', async (req, res) => {
  try {
    const { feedback } = req.body;
    const updated = await hr.processFeedback(req.params.id, feedback);
    res.json(updated);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
