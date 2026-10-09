import { Router } from 'express';
import { ContentManager } from '../services/ContentManager';
import { HephaistosVoiceAgent } from '../agents/HephaistosVoiceAgent';
import { MayaVisualAgent } from '../agents/MayaVisualAgent';
import { ActivityLogger } from '../services/ActivityLogger';

const router = Router();
const contentManager = new ContentManager();

// GET all
router.get('/', (req, res) => {
  const pieces = contentManager.getAll();
  res.json(pieces);
});

// GET by ID
router.get('/:id', (req, res) => {
  const piece = contentManager.getById(req.params.id);
  if (piece) res.json(piece);
  else res.status(404).json({ error: 'Not found' });
});

// APPROVE HOOK -> Generate Voiceover & Timestamps
router.post('/:id/approve', (req, res) => {
  const { selectedHook } = req.body;
  const piece = contentManager.getById(req.params.id);
  if (!piece) return res.status(404).json({ error: 'Not found' });

  contentManager.createOrUpdate({
    id: piece.id,
    topic: piece.topic,
    selectedHook,
    status: 'voiceover'
  });

  res.json({ success: true, message: 'Skript freigegeben. Voiceover & Timestamp Generierung gestartet.' });

  // Fire off background Voiceover
  (async () => {
    try {
      const hrLogger = new ActivityLogger();
      hrLogger.log({
        agentId: 'human',
        sessionId: piece.id,
        action: 'Skript freigegeben',
        details: `Hook ausgewählt: ${selectedHook}\nVoiceover gestartet!`,
        status: 'success'
      });

      const scriptData = piece.qaData?.final_script || piece.scriptData;
      if (!scriptData) throw new Error("Kein Script Data gefunden");

      const hookText = scriptData[selectedHook];
      const scenes = scriptData.scenes || [];
      const ctaText = scriptData.call_to_action;

      const hephaistos = new HephaistosVoiceAgent(piece.id);
      const { audioUrl, timestamps } = await hephaistos.generateVoiceover(hookText, scenes, ctaText);

      // Save audio URL and timestamps back to DB
      contentManager.createOrUpdate({
        id: piece.id,
        topic: piece.topic,
        audioUrl: audioUrl,
        timestamps: timestamps,
        status: 'audio_ready'
      });

    } catch (err: any) {
      console.error("[Voiceover Pipeline Error]", err);
      const errLogger = new ActivityLogger();
      errLogger.log({ agentId: 'system', sessionId: piece.id, action: 'Fehler in Voiceover', details: err.message, status: 'error' });
      contentManager.createOrUpdate({ id: piece.id, topic: piece.topic, status: 'error' });
    }
  })();
});

// GENERATE VISUALS (STORYBOARD)
router.post('/:id/visuals', (req, res) => {
  const piece = contentManager.getById(req.params.id);
  if (!piece) return res.status(404).json({ error: 'Not found' });
  if (!piece.audioUrl) return res.status(400).json({ error: 'Audio fehlt für Visual Generierung' });

  contentManager.createOrUpdate({
    id: piece.id,
    topic: piece.topic,
    status: 'visuals' // Spinner state
  });

  res.json({ success: true, message: 'Storyboard Generierung (Maya) gestartet.' });

  (async () => {
    try {
      const hrLogger = new ActivityLogger();
      hrLogger.log({ agentId: 'human', sessionId: piece.id, action: 'Visuals gestartet', details: 'Maya baut das 3D Storyboard', status: 'success' });
      
      const scriptData = piece.qaData?.final_script || piece.scriptData;
      const scenes = scriptData.scenes || [];
      const hookText = scriptData[piece.selectedHook!] || scriptData.hook_1;
      const ctaText = scriptData.call_to_action || '';
      
      const allScenes = [
        { voice: hookText, visual: 'High engagement opener, vivid striking image' },
        ...scenes,
        { voice: ctaText, visual: 'Call to action ending, clear focal point' }
      ];
      
      const maya = new MayaVisualAgent(piece.id);
      const storyboard = await maya.generateStoryboard(allScenes);
      
      contentManager.createOrUpdate({
        id: piece.id,
        topic: piece.topic,
        storyboard: storyboard,
        status: 'visuals_ready'
      });
    } catch (err: any) {
      contentManager.createOrUpdate({ id: piece.id, topic: piece.topic, status: 'error' });
    }
  })();
});

// RENDER VIDEO (HYPERFRAMES)
router.post('/:id/render', (req, res) => {
  const piece = contentManager.getById(req.params.id);
  if (!piece) return res.status(404).json({ error: 'Not found' });
  if (!piece.storyboard) return res.status(400).json({ error: 'Storyboard fehlt für Video Rendering' });

  contentManager.createOrUpdate({
    id: piece.id,
    topic: piece.topic,
    status: 'rendering'
  });

  res.json({ success: true, message: 'Storyboard freigegeben. Video Rendering (Remotion) gestartet.' });

  // Fire off background Render
  (async () => {
    try {
      const hrLogger = new ActivityLogger();
      hrLogger.log({
        agentId: 'human',
        sessionId: piece.id,
        action: 'Storyboard freigegeben',
        details: `HyperFrames startet mit dem Remotion Rendering!`,
        status: 'success'
      });
      
      const maya = new MayaVisualAgent(piece.id);
      const { videoUrl } = await maya.renderVideo({ storyboard: piece.storyboard, timestamps: piece.timestamps, audioUrl: piece.audioUrl });
      
      contentManager.createOrUpdate({
        id: piece.id,
        topic: piece.topic,
        status: 'completed',
        videoUrl: videoUrl
      });
    } catch (err: any) {
      console.error("[Render Error]", err);
      contentManager.createOrUpdate({ id: piece.id, topic: piece.topic, status: 'error' });
    }
  })();
});

// DELETE by ID
router.delete('/:id', (req, res) => {
  const piece = contentManager.getById(req.params.id);
  if (!piece) return res.status(404).json({ error: 'Not found' });
  
  contentManager.delete(req.params.id);
  res.json({ success: true, message: 'Content Piece deleted' });
});

export default router;
