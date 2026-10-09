"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ActivityLogger_1 = require("../services/ActivityLogger");
const router = (0, express_1.Router)();
const logger = new ActivityLogger_1.ActivityLogger();
router.get('/:id/activity', (req, res) => {
    const { id } = req.params;
    const logs = logger.getLogs(id);
    res.json(logs);
});
router.get('/activity', (req, res) => {
    const logs = logger.getLogs();
    res.json(logs);
});
exports.default = router;
