import { Router } from 'express';
import { ContentManager } from '../services/ContentManager';
import { HephaistosVoiceAgent } from '../agents/HephaistosVoiceAgent';
import { ActivityLogger } from '../services/ActivityLogger';


const router = Router();
const contentManager = new ContentManager();

router.get('/', (req, res) => {
  const pieces = contentManager.getAll();
  // Sort newest first
  pieces.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  res.json(pieces);
});

router.get('/:id', (req, res) => {
  const piece = contentManager.getById(req.params.id);
  if (!piece) return res.status(404).json({ error: 'Not found' });
  res.json(piece);
});

// Update hook selection and trigger Phase 2
router.post('/:id/approve', (req, res) => {
  const { selectedHook } = req.body;
  const piece = contentManager.getById(req.params.id);
  if (!piece) return res.status(404).json({ error: 'Not found' });

  contentManager.createOrUpdate({
    id: piece.id,
    topic: piece.topic,
    selectedHook,
    status: 'production'
  });

  res.json({ success: true, message: 'Freigabe erteilt. Phase 2 (Produktion) gestartet.' });

  // Fire off background production
  (async () => {
    try {
      const hrLogger = new ActivityLogger();
      hrLogger.log({
        agentId: 'human',
        sessionId: piece.id,
        action: 'Freigabe erteilt',
        details: `Hook ausgewählt: ${selectedHook}\nProduktion gestartet!`,
        status: 'success'
      });

      // 1. Voiceover
      const scriptData = piece.scriptData;
      if (!scriptData) throw new Error("Kein Script Data gefunden");

      const hookText = scriptData[selectedHook];
      const bodyText = scriptData.body;
      const ctaText = scriptData.call_to_action;

      const hephaistos = new HephaistosVoiceAgent(piece.id);
      const audioUrl = await hephaistos.generateVoiceover(hookText, bodyText, ctaText);

      // Save audio URL back to DB
      contentManager.createOrUpdate({
        id: piece.id,
        topic: piece.topic,
        audioUrl: audioUrl
      });

    } catch (err: any) {
      console.error("[Production Pipeline Error]", err);
      
      const errLogger = new ActivityLogger();
      errLogger.log({
        agentId: 'system',
        sessionId: piece.id,
        action: 'Fehler in Produktion',
        details: err.message || 'Unbekannter Fehler bei Hephaistos',
        status: 'error'
      });

      contentManager.createOrUpdate({
        id: piece.id,
        topic: piece.topic,
        status: 'error'
      });
    }
  })();
});

router.delete('/:id', (req, res) => {
  contentManager.delete(req.params.id);
  res.json({ success: true, message: 'Content Piece gelöscht.' });
});


// Set error status if pipeline fails
router.post('/:id/error', (req, res) => {
  const piece = contentManager.getById(req.params.id);
  if (piece) {
    contentManager.createOrUpdate({
      id: piece.id,
      topic: piece.topic,
      status: 'idea' // reset or set error state
    });
  }
  res.json({ success: true });
});


router.post('/:id/regenerate-script', async (req, res) => {
  const { id } = req.params;
  const piece = contentManager.getById(id);
  if (!piece) return res.status(404).json({ error: 'Not found' });

  // Update DB to scripting
  contentManager.createOrUpdate({
    id: piece.id,
    topic: piece.topic,
    scriptData: null,
    qaData: null,
    status: 'scripting'
  });

  res.json({ status: 'scripting' });

  // Call studio orchestrator to resume pipeline
  try {
    const fetch = require('node-fetch'); // Make sure fetch works
    await fetch('http://localhost:4000/api/studio/pipeline/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        sessionId: piece.id, 
        prompt: piece.topic,
        researchScope: 'kb_and_web',
        moduleFilter: 'all'
      })
    });
  } catch (e) {
    console.error('Error restarting pipeline for script generation:', e);
  }
});

export default router;
