import { Router } from 'express';
import { PrometheusIngestionAgent } from '../agents/PrometheusIngestionAgent';

const router = Router();

router.post('/youtube', async (req, res) => {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'Missing YouTube URL' });
  }

  try {
    // Instantiate Prometheus here so env vars are guaranteed to be loaded
    const prometheusIngest = new PrometheusIngestionAgent();
    
    const savedPath = await prometheusIngest.processYouTubeVideo(url);
    res.json({ 
      success: true, 
      message: 'Video erfolgreich von Prometheus importiert und strukturiert.',
      path: savedPath,
      agentState: prometheusIngest.getProfile()
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
