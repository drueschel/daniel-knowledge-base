"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const EmployeeService_1 = require("../services/EmployeeService");
const router = (0, express_1.Router)();
const hr = new EmployeeService_1.EmployeeService();
router.get('/', (req, res) => {
    res.json(hr.getAll());
});
router.put('/:id', (req, res) => {
    try {
        const updated = hr.update(req.params.id, req.body);
        res.json(updated);
    }
    catch (e) {
        res.status(404).json({ error: e.message });
    }
});
router.post('/:id/feedback', async (req, res) => {
    try {
        const { feedback } = req.body;
        const updated = await hr.processFeedback(req.params.id, feedback);
        res.json(updated);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
exports.default = router;
