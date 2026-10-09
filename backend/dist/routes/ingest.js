"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PrometheusIngestionAgent_1 = require("../agents/PrometheusIngestionAgent");
const router = (0, express_1.Router)();
router.post('/youtube', async (req, res) => {
    const { url } = req.body;
    if (!url) {
        return res.status(400).json({ error: 'Missing YouTube URL' });
    }
    try {
        // Instantiate Prometheus here so env vars are guaranteed to be loaded
        const prometheusIngest = new PrometheusIngestionAgent_1.PrometheusIngestionAgent();
        const savedPath = await prometheusIngest.processYouTubeVideo(url);
        res.json({
            success: true,
            message: 'Video erfolgreich von Prometheus importiert und strukturiert.',
            path: savedPath,
            agentState: prometheusIngest.getProfile()
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
