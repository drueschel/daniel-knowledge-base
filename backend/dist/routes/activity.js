"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ActivityLogger_1 = require("../services/ActivityLogger");
const router = (0, express_1.Router)();
const logger = new ActivityLogger_1.ActivityLogger();
router.get('/', (req, res) => {
    const logs = logger.getLogs();
    res.json(logs);
});
router.delete('/', (req, res) => {
    logger.clearLogs();
    res.json({ success: true });
});
exports.default = router;
