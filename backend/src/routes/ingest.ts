import { Router } from 'express';
import { FelixIngestionAgent } from '../agents/FelixIngestionAgent';

const router = Router();
const felix = new FelixIngestionAgent();

router.post('/youtube', async (req, res) => {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'Missing YouTube URL' });
  }

  try {
    const savedPath = await felix.processYouTubeVideo(url);
    res.json({ 
      success: true, 
      message: 'Video erfolgreich von Felix importiert und strukturiert.',
      path: savedPath,
      agentState: felix.getProfile()
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
