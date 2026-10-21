"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
// Check status of Tavus API configuration
router.get('/status', (req, res) => {
    const apiKey = process.env.TAVUS_API_KEY;
    res.json({
        configured: !!apiKey && apiKey.trim().length > 0,
        hasKey: !!apiKey
    });
});
// Get available replicas/personas
router.get('/replicas', async (req, res) => {
    const apiKey = req.headers['x-api-key'] || process.env.TAVUS_API_KEY;
    if (!apiKey) {
        return res.status(400).json({ error: 'TAVUS_API_KEY fehlt in .env oder Request Header' });
    }
    try {
        const response = await fetch('https://tavusapi.com/v2/replicas', {
            headers: { 'x-api-key': apiKey }
        });
        if (!response.ok) {
            const err = await response.text();
            return res.status(response.status).json({ error: err });
        }
        const data = await response.json();
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Get current Persona details (system prompt, replica, layers)
router.get('/persona', async (req, res) => {
    const apiKey = req.headers['x-api-key'] || process.env.TAVUS_API_KEY;
    const personaId = req.query.personaId || 'p06ce91c651b';
    if (!apiKey)
        return res.status(400).json({ error: 'TAVUS_API_KEY fehlt' });
    try {
        const response = await fetch(`https://tavusapi.com/v2/personas/${personaId}`, {
            headers: { 'x-api-key': apiKey }
        });
        if (!response.ok) {
            const err = await response.text();
            return res.status(response.status).json({ error: err });
        }
        const data = await response.json();
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Update Persona details (system prompt, greeting, etc.)
router.patch('/persona', async (req, res) => {
    const apiKey = req.headers['x-api-key'] || process.env.TAVUS_API_KEY;
    const personaId = req.body?.personaId || 'p06ce91c651b';
    const { systemPrompt, greeting, replicaId } = req.body || {};
    if (!apiKey)
        return res.status(400).json({ error: 'TAVUS_API_KEY fehlt' });
    try {
        const patchDoc = [];
        if (systemPrompt !== undefined)
            patchDoc.push({ op: 'replace', path: '/system_prompt', value: systemPrompt });
        if (greeting !== undefined)
            patchDoc.push({ op: 'replace', path: '/greeting', value: greeting });
        if (replicaId !== undefined)
            patchDoc.push({ op: 'replace', path: '/default_replica_id', value: replicaId });
        if (patchDoc.length === 0) {
            return res.status(400).json({ error: 'Keine Änderungen übergeben' });
        }
        const response = await fetch(`https://tavusapi.com/v2/personas/${personaId}`, {
            method: 'PATCH',
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(patchDoc)
        });
        if (!response.ok) {
            const err = await response.text();
            return res.status(response.status).json({ error: err });
        }
        const data = await response.json();
        res.json({ success: true, data });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Create Reality-Check Live Conversation
router.post('/create-session', async (req, res) => {
    const apiKey = req.body?.apiKey || process.env.TAVUS_API_KEY;
    if (!apiKey) {
        return res.status(400).json({ error: 'TAVUS_API_KEY fehlt. Bitte trage den Key in backend/.env ein oder sende ihn im Body mit.' });
    }
    const { replicaId, personaId } = req.body || {};
    try {
        const activePersonaId = personaId || 'p06ce91c651b';
        const payload = {
            persona_id: activePersonaId,
            conversation_name: `Reality-Check Session ${new Date().toLocaleTimeString('de-DE')}`,
            properties: {
                max_call_duration: 3600, // 60 mins
                participant_left_timeout: 300, // 5 mins buffer for reconnects or pauses
                participant_absent_timeout: 300 // 5 mins buffer to join
            }
        };
        if (replicaId)
            payload.replica_id = replicaId;
        const response = await fetch('https://tavusapi.com/v2/conversations', {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            const err = await response.text();
            return res.status(response.status).json({ error: `Tavus API Error (${response.status}): ${err}` });
        }
        const data = await response.json();
        res.json({
            success: true,
            conversationId: data.conversation_id,
            conversationUrl: data.conversation_url
        });
    }
    catch (err) {
        console.error('[Tavus Session Error]', err);
        res.status(500).json({ error: err.message });
    }
});
// End active conversation
router.post('/end-session/:conversationId', async (req, res) => {
    const apiKey = req.body?.apiKey || process.env.TAVUS_API_KEY;
    const { conversationId } = req.params;
    if (!apiKey)
        return res.status(400).json({ error: 'TAVUS_API_KEY fehlt' });
    try {
        const response = await fetch(`https://tavusapi.com/v2/conversations/${conversationId}/end`, {
            method: 'POST',
            headers: { 'x-api-key': apiKey }
        });
        const data = await response.json().catch(() => ({}));
        res.json({ success: true, data });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.default = router;
