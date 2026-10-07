import { Router } from 'express';
import { PrometheusDataAgent } from '../agents/PrometheusDataAgent';
import { AthenaStrategyAgent } from '../agents/AthenaStrategyAgent';
import { CalliopeCreativeAgent } from '../agents/CalliopeCreativeAgent';
import { ThemisQaAgent } from '../agents/ThemisQaAgent';
import { ContentManager } from '../services/ContentManager';
import { ActivityLogger } from '../services/ActivityLogger';

const router = Router();
const contentManager = new ContentManager();
const activityLogger = new ActivityLogger();

// In-memory cache for the current session — but always falls back to persisted DB
const sessionCache: Record<string, any> = {};

/**
 * Load session state: prefer in-memory cache, fall back to persisted content_pieces.json.
 * This ensures a tsx hot-reload doesn't kill a running pipeline mid-way.
 */
function getState(sessionId: string, topic: string): any {
  if (sessionCache[sessionId]) return sessionCache[sessionId];

  // Try to restore from disk
  const persisted = contentManager.getById(sessionId);
  if (persisted) {
    sessionCache[sessionId] = {
      id: sessionId,
      topic: persisted.topic,
      research: persisted.researchData || null,
      strategy: persisted.strategyData || null,
      script: persisted.scriptData || null,
      qa: persisted.qaData || null,
      status: persisted.status,
      qaFeedback: null,
    };
    console.log(`[Studio] Restored session ${sessionId} from disk.`);
    return sessionCache[sessionId];
  }

  // Fresh session
  sessionCache[sessionId] = { id: sessionId, topic, research: null, strategy: null, script: null, qa: null, qaFeedback: null, status: 'scripting' };
  return sessionCache[sessionId];
}

router.get('/session/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  res.json(sessionCache[sessionId] || {});
});


// ----------------- PIPELINE ORCHESTRATOR -----------------
router.post('/pipeline/start', async (req, res) => {
  const { sessionId, prompt, researchScope, moduleFilter } = req.body;
  
  // Return immediately to the client
  res.json({ status: 'started', sessionId });
  
  // Run asynchronously in the background
  (async () => {
    try {
      const topic = prompt.substring(0, 50) + '...';
      const state = getState(sessionId, topic);
      
      const hrLogger = new ActivityLogger();
      hrLogger.log({
        agentId: 'human',
        sessionId: sessionId,
        action: 'Briefing eingereicht',
        details: prompt,
        status: 'success'
      });

      
      // 1. Data (Prometheus)
      if (!state.research) {
        activityLogger.log({
          agentId: 'orchestrator',
          sessionId,
          action: 'E2E Produktion gestartet (Briefing)',
          details: `Briefing: "${prompt}"
Quelle: ${moduleFilter}
Scope: ${researchScope}`,
          status: 'success',
          model: 'claude-sonnet-5-5'
        });

        console.log(`[Pipeline] Starting Data for ${sessionId}`);
        const dataRes = await fetch(`http://localhost:4000/api/studio/data`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, prompt, researchScope, moduleFilter })
        });
        if (!dataRes.ok) throw new Error("Data step failed");
      }
      
      // 2. Strategy (Athena)
      if (!state.strategy) {
        console.log(`[Pipeline] Starting Strategy for ${sessionId}`);
        const stratRes = await fetch(`http://localhost:4000/api/studio/strategy`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, prompt, researchScope, moduleFilter })
        });
        if (!stratRes.ok) throw new Error("Strategy step failed");
      }
      
      // 3 & 4. Script (Calliope) & QA (Themis) Loop
      let qaPassed = false;
      let retries = 0;
      
      while (!qaPassed && retries < 3) {
        if (!state.script) {
          console.log(`[Pipeline] Starting Script for ${sessionId} (Attempt ${retries + 1})`);
          const scriptRes = await fetch(`http://localhost:4000/api/studio/creative`, {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sessionId, prompt, researchScope, moduleFilter })
          });
          if (!scriptRes.ok) throw new Error("Script step failed");
          // Refresh state from DB to get the new script
          Object.assign(state, getState(sessionId, topic));
        }
        
        console.log(`[Pipeline] Starting QA for ${sessionId}`);
        const qaRes = await fetch(`http://localhost:4000/api/studio/qa`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, prompt, researchScope, moduleFilter })
        });
        if (!qaRes.ok) throw new Error("QA step failed");
        
        // Refresh state from DB
        Object.assign(state, getState(sessionId, topic));
        
        if (state.qa && state.qa.status === 'rejected') {
          console.log(`[Pipeline] QA Rejected. Retrying script...`);
          state.script = null; // Force script regeneration
          retries++;
        } else {
          qaPassed = true;
        }
      }
      
      if (!qaPassed) {
         // If it still failed after retries, mark as error
         contentManager.createOrUpdate({ id: sessionId, topic, status: 'error' });
         state.status = 'error';
         throw new Error("QA failed after max retries");
      }
      
      state.status = 'review';
      console.log(`[Pipeline] Successfully finished pipeline for ${sessionId}`);
    } catch (err) {
      console.error(`[Pipeline Error]`, err);
      // Mark as error in database so frontend stops spinning
      contentManager.createOrUpdate({ id: sessionId, topic: prompt.substring(0, 50) + '...', status: 'error' });
      state.status = 'error';
    }
  })();
});
// ---------------------------------------------------------

router.post('/:agentId', async (req, res) => {
  const { agentId } = req.params;
  const {
    sessionId = 'default',
    prompt = 'Überrasche mich',
    researchScope = 'kb_and_web',
    moduleFilter = 'all',
  } = req.body;
  const topic = prompt.substring(0, 50) + '...';

  try {
    const state = getState(sessionId, topic);

    if (agentId === 'data') { // Prometheus
      const prometheus = new PrometheusDataAgent(sessionId);
      const result = await prometheus.research(prompt, researchScope, moduleFilter);
      state.research = result;
      contentManager.createOrUpdate({ id: sessionId, topic, researchData: result, status: 'scripting' });
      return res.json(result);
    }

    else if (agentId === 'strategy') { // Athena
      if (!state.research) {
        return res.status(400).json({ error: 'Fehler: Forschungsdaten fehlen (Prometheus hat nicht geliefert).' });
      }
      const athena = new AthenaStrategyAgent(sessionId);
      const result = await athena.defineStrategy(state.research);
      state.strategy = result;
      contentManager.createOrUpdate({ id: sessionId, topic, strategyData: result });
      return res.json(result);
    }

    else if (agentId === 'creative') { // Calliope
      if (!state.research || !state.strategy) {
        return res.status(400).json({ error: 'Fehler: Research- oder Strategy-Daten fehlen.' });
      }
      const calliope = new CalliopeCreativeAgent(sessionId);
      const result = await calliope.writeScript(state.research, state.strategy, state.qaFeedback);
      state.script = result;
      contentManager.createOrUpdate({ id: sessionId, topic, scriptData: result });
      return res.json(result);
    }

    else if (agentId === 'qa') { // Themis
      if (!state.research || !state.script || !state.strategy) {
        return res.status(400).json({ error: 'Fehler: Voraussetzungen für QA fehlen.' });
      }
      const themis = new ThemisQaAgent(sessionId);
      const result = await themis.reviewScript(state.script, state.research, state.strategy);
      state.qa = result;

      if (result.status === 'rejected') {
        state.qaFeedback = result.feedback;
        state.status = 'scripting';
        contentManager.createOrUpdate({ id: sessionId, topic, qaData: result, status: 'scripting' });
      } else {
        state.status = 'review';
        contentManager.createOrUpdate({ id: sessionId, topic, qaData: result, status: 'review' });
      }
      return res.json(result);
    }

    else {
      // Mock other agents (Voice, Visuals, Dist)
      await new Promise(resolve => setTimeout(resolve, 1000));
      return res.json({ status: 'mocked_success', message: `${agentId} completed` });
    }

  } catch (error: any) {
    console.error(`[Studio] Error in agent ${agentId}:`, error.message);
    res.status(500).json({ error: error.message });
  }
});


// ----------------- REGENERATE SCRIPT -----------------
router.post('/pipeline/regenerate-script/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  
  // Clear memory cache for script and qa
  if (sessionCache[sessionId]) {
    sessionCache[sessionId].script = null;
    sessionCache[sessionId].qa = null;
    sessionCache[sessionId].qaFeedback = null;
    sessionCache[sessionId].status = 'scripting';
  }

  // Clear DB
  const piece = contentManager.getById(sessionId);
  if (!piece) return res.status(404).json({ error: 'Not found' });
  
  contentManager.createOrUpdate({
    id: sessionId,
    topic: piece.topic,
    scriptData: null,
    qaData: null,
    status: 'scripting'
  });

  res.json({ status: 'scripting', sessionId });

  // Start pipeline
  try {
    const prompt = piece.topic; // approximate
    await fetch(`http://localhost:4000/api/studio/pipeline/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, prompt, researchScope: 'kb_and_web', moduleFilter: 'all' })
    });
  } catch (err) {
    console.error('Failed to restart pipeline', err);
  }
});

export default router;
