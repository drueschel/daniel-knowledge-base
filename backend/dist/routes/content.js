"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const express_1 = require("express");
const ContentManager_1 = require("../services/ContentManager");
const multer_1 = __importDefault(require("multer"));
const UgcIngestionAgent_1 = require("../agents/UgcIngestionAgent");
const UgcDirectorAgent_1 = require("../agents/UgcDirectorAgent");
const uploadDir = path.join(process.cwd(), 'data/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, `ugc_${Date.now()}_${file.originalname}`)
});
const upload = (0, multer_1.default)({ storage });
const HephaistosVoiceAgent_1 = require("../agents/HephaistosVoiceAgent");
const MayaVisualAgent_1 = require("../agents/MayaVisualAgent");
const ActivityLogger_1 = require("../services/ActivityLogger");
const router = (0, express_1.Router)();
const contentManager = new ContentManager_1.ContentManager();
// GET all
// UPLOAD UGC VIDEO ENDPOINT
router.post('/upload-ugc', upload.single('video'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No video file provided' });
        }
        const sessionId = 'ugc_' + Date.now();
        const videoUrl = `/data/uploads/${req.file.filename}`;
        // Create new content piece
        contentManager.createOrUpdate({
            id: sessionId,
            topic: 'UGC Upload',
            status: 'scripting',
            isUgc: true,
            ugcVideoUrl: videoUrl,
            audioUrl: videoUrl // we'll use the video itself for audio extraction or playback
        });
        res.json({ success: true, sessionId });
        // Background processing
        (async () => {
            try {
                const ingestion = new UgcIngestionAgent_1.UgcIngestionAgent(sessionId);
                const { transcript, timestamps } = await ingestion.processUgcVideo(req.file.path);
                contentManager.createOrUpdate({
                    id: sessionId,
                    topic: 'UGC: ' + transcript.substring(0, 30) + '...',
                    status: 'audio_ready', // User must review transcript next
                    audioUrl: "/data/audio/voice_" + sessionId + ".mp3",
                    ugcVideoUrl: videoUrl,
                    scriptData: { body: transcript }, // Save transcript for user editing
                    timestamps
                });
            }
            catch (err) {
                console.error('UGC Background Error:', err);
                contentManager.createOrUpdate({
                    id: sessionId,
                    topic: 'UGC Upload Error',
                    status: 'error'
                });
            }
        })();
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.get('/', (req, res) => {
    const pieces = contentManager.getAll();
    res.json(pieces);
});
// GET by ID
router.get('/:id', (req, res) => {
    const piece = contentManager.getById(req.params.id);
    if (piece)
        res.json(piece);
    else
        res.status(404).json({ error: 'Not found' });
});
// APPROVE HOOK -> Generate Voiceover & Timestamps
router.post('/:id/approve', (req, res) => {
    const { selectedHook } = req.body;
    const piece = contentManager.getById(req.params.id);
    if (!piece)
        return res.status(404).json({ error: 'Not found' });
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
            const hrLogger = new ActivityLogger_1.ActivityLogger();
            hrLogger.log({
                agentId: 'human',
                sessionId: piece.id,
                action: 'Skript freigegeben',
                details: `Hook ausgewählt: ${selectedHook}\nVoiceover gestartet!`,
                status: 'success'
            });
            const scriptData = piece.qaData?.final_script || piece.scriptData;
            if (!scriptData)
                throw new Error("Kein Script Data gefunden");
            const hookText = scriptData[selectedHook];
            const scenes = scriptData.scenes || [];
            const ctaText = scriptData.call_to_action;
            const hephaistos = new HephaistosVoiceAgent_1.HephaistosVoiceAgent(piece.id);
            const { audioUrl, timestamps } = await hephaistos.generateVoiceover(hookText, scenes, ctaText);
            // Save audio URL and timestamps back to DB
            contentManager.createOrUpdate({
                id: piece.id,
                topic: piece.topic,
                audioUrl: audioUrl,
                timestamps: timestamps,
                status: 'audio_ready'
            });
        }
        catch (err) {
            console.error("[Voiceover Pipeline Error]", err);
            const errLogger = new ActivityLogger_1.ActivityLogger();
            errLogger.log({ agentId: 'system', sessionId: piece.id, action: 'Fehler in Voiceover', details: err.message, status: 'error' });
            contentManager.createOrUpdate({ id: piece.id, topic: piece.topic, status: 'error' });
        }
    })();
});
// GENERATE VISUALS (STORYBOARD)
// UGC DIRECTOR (PLAN STORYBOARD)
router.post('/:id/ugc-director', (req, res) => {
    const piece = contentManager.getById(req.params.id);
    if (!piece || !piece.isUgc)
        return res.status(404).json({ error: 'Not found or not UGC' });
    contentManager.createOrUpdate({
        id: piece.id,
        topic: piece.topic,
        status: 'scripting' // Reusing scripting state for the loading spinner
    });
    res.json({ success: true, message: 'Director plant das Storyboard.' });
    (async () => {
        try {
            const director = new UgcDirectorAgent_1.UgcDirectorAgent(piece.id);
            // Pass the manually reviewed transcript
            const transcript = piece.scriptData?.body || '';
            const videoSource = piece.ugcVideoUrl || piece.audioUrl?.replace('/data/audio/voice_', '/data/uploads/') || '';
            const plannedStoryboard = await director.planStoryboard(transcript, videoSource);
            contentManager.createOrUpdate({
                id: piece.id,
                topic: piece.topic,
                status: 'storyboard_planned',
                plannedStoryboard
            });
        }
        catch (err) {
            console.error("[UGC Director Error]", err);
            contentManager.createOrUpdate({ id: piece.id, topic: piece.topic, status: 'error' });
        }
    })();
});
router.post('/:id/visuals', (req, res) => {
    const piece = contentManager.getById(req.params.id);
    if (!piece)
        return res.status(404).json({ error: 'Not found' });
    if (!piece.audioUrl)
        return res.status(400).json({ error: 'Audio fehlt für Visual Generierung' });
    contentManager.createOrUpdate({
        id: piece.id,
        topic: piece.topic,
        status: 'visuals' // Spinner state
    });
    res.json({ success: true, message: 'Storyboard Generierung (Maya) gestartet.' });
    (async () => {
        try {
            const hrLogger = new ActivityLogger_1.ActivityLogger();
            hrLogger.log({ agentId: 'human', sessionId: piece.id, action: 'Visuals gestartet', details: 'Maya baut das 3D Storyboard', status: 'success' });
            let allScenes = [];
            if (piece.isUgc && piece.plannedStoryboard) {
                allScenes = piece.plannedStoryboard;
            }
            else {
                const scriptData = piece.qaData?.final_script || piece.scriptData;
                const scenes = scriptData.scenes || [];
                const hookText = scriptData[piece.selectedHook] || scriptData.hook_1;
                const ctaText = scriptData.call_to_action || '';
                allScenes = [
                    { voice: hookText, visual: 'High engagement opener, vivid striking image' },
                    ...scenes,
                    { voice: ctaText, visual: 'Call to action ending, clear focal point' }
                ];
            }
            const maya = new MayaVisualAgent_1.MayaVisualAgent(piece.id);
            const storyboard = await maya.generateStoryboard(allScenes);
            contentManager.createOrUpdate({
                id: piece.id,
                topic: piece.topic,
                storyboard: storyboard,
                status: 'visuals_ready'
            });
        }
        catch (err) {
            contentManager.createOrUpdate({ id: piece.id, topic: piece.topic, status: 'error' });
        }
    })();
});
// RENDER VIDEO (HYPERFRAMES)
router.post('/:id/render', (req, res) => {
    const piece = contentManager.getById(req.params.id);
    if (!piece)
        return res.status(404).json({ error: 'Not found' });
    if (!piece.storyboard)
        return res.status(400).json({ error: 'Storyboard fehlt für Video Rendering' });
    contentManager.createOrUpdate({
        id: piece.id,
        topic: piece.topic,
        status: 'rendering'
    });
    res.json({ success: true, message: 'Storyboard freigegeben. Video Rendering (Remotion) gestartet.' });
    // Fire off background Render
    (async () => {
        try {
            const hrLogger = new ActivityLogger_1.ActivityLogger();
            hrLogger.log({
                agentId: 'human',
                sessionId: piece.id,
                action: 'Storyboard freigegeben',
                details: `HyperFrames startet mit dem Remotion Rendering!`,
                status: 'success'
            });
            const maya = new MayaVisualAgent_1.MayaVisualAgent(piece.id);
            const { videoUrl } = await maya.renderVideo({ storyboard: piece.storyboard, timestamps: piece.timestamps, audioUrl: piece.audioUrl });
            contentManager.createOrUpdate({
                id: piece.id,
                topic: piece.topic,
                status: 'completed',
                videoUrl: videoUrl
            });
        }
        catch (err) {
            console.error("[Render Error]", err);
            contentManager.createOrUpdate({ id: piece.id, topic: piece.topic, status: 'error' });
        }
    })();
});
// DELETE by ID
router.delete('/:id', (req, res) => {
    const piece = contentManager.getById(req.params.id);
    if (!piece)
        return res.status(404).json({ error: 'Not found' });
    contentManager.delete(req.params.id);
    res.json({ success: true, message: 'Content Piece deleted' });
});
// PREVIEW ENDPOINT for Remotion Studio Iframe
router.get('/preview/:id', async (req, res) => {
    try {
        const piece = contentManager.getById(req.params.id);
        if (!piece || !piece.storyboard)
            return res.status(404).json({ error: 'Not found' });
        const fps = 30;
        const remotionScenes = [];
        const sceneBoundaries = [];
        let currentTsIndex = 0;
        for (let i = 0; i < piece.storyboard.length; i++) {
            const rawWords = piece.storyboard[i].voice.split(' ').filter((w) => w.length > 0);
            let startBoundary = i === 0 ? 0 : sceneBoundaries[i - 1].end;
            let endBoundary = startBoundary + 3.0;
            let mappedWords = [];
            if (piece.timestamps && piece.timestamps.length > currentTsIndex) {
                const sceneTimestamps = piece.timestamps.slice(currentTsIndex, currentTsIndex + rawWords.length);
                if (sceneTimestamps.length > 0) {
                    const lastWord = sceneTimestamps[sceneTimestamps.length - 1];
                    if (currentTsIndex + rawWords.length < piece.timestamps.length) {
                        const nextWord = piece.timestamps[currentTsIndex + rawWords.length];
                        endBoundary = (lastWord.end + nextWord.start) / 2;
                    }
                    else {
                        endBoundary = lastWord.end + 1.0;
                    }
                    mappedWords = sceneTimestamps.map((ts) => ({
                        word: ts.word,
                        startFrame: Math.max(0, Math.round((ts.start - startBoundary) * fps))
                    }));
                }
                currentTsIndex += rawWords.length;
            }
            else {
                startBoundary = i === 0 ? 0 : (sceneBoundaries[i - 1] ? sceneBoundaries[i - 1].end : 0);
                endBoundary = startBoundary + Math.max(3, rawWords.length * 0.5);
                mappedWords = rawWords.map((w, idx) => ({ word: w, startFrame: idx * 8 + 10 }));
            }
            sceneBoundaries.push({ start: startBoundary, end: endBoundary, words: mappedWords });
        }
        for (let i = 0; i < piece.storyboard.length; i++) {
            const scene = piece.storyboard[i];
            const boundary = sceneBoundaries[i];
            const durationSec = boundary.end - boundary.start;
            const durationInFrames = Math.max(30, Math.round(durationSec * fps));
            let imageUrl = scene.imageUrl || `https://picsum.photos/seed/${piece.id}_${i}_${Date.now()}/800/800`;
            if (imageUrl.startsWith('/')) {
                imageUrl = `http://localhost:4000${imageUrl}`;
            }
            remotionScenes.push({
                durationInFrames,
                headline: scene.visual_instruction || `Szene ${i + 1}`,
                words: boundary.words,
                imageUrl
            });
        }
        const remotionData = {
            audioUrl: piece.audioUrl ? `http://localhost:4000${piece.audioUrl}` : null,
            scenes: remotionScenes
        };
        const storyboardPath = path.join(process.cwd(), '../video-engine/src/storyboard.json');
        fs.writeFileSync(storyboardPath, JSON.stringify(remotionData, null, 2));
        res.json({ success: true, previewUrl: 'http://localhost:3000' });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.default = router;
