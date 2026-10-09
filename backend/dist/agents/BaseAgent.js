"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseAgent = void 0;
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const ActivityLogger_1 = require("../services/ActivityLogger");
const EmployeeService_1 = require("../services/EmployeeService");
class BaseAgent {
    profile;
    activityLogger;
    currentSessionId;
    constructor(employeeId, sessionId) {
        this.currentSessionId = sessionId;
        const hr = new EmployeeService_1.EmployeeService();
        const emp = hr.getById(employeeId);
        if (!emp)
            throw new Error(`Employee with id ${employeeId} not found`);
        this.profile = emp;
        this.activityLogger = new ActivityLogger_1.ActivityLogger();
    }
    getProfile() {
        return this.profile;
    }
    log(message, type = 'info', data) {
        console.log(`[Agent: ${this.profile.name}] ${message}`);
        // Log persistently to activity_log.json
        if (type === 'success' || type === 'error') {
            this.activityLogger.log({
                agentId: this.profile.id,
                sessionId: this.currentSessionId,
                action: message,
                details: data ? JSON.stringify(data) : '',
                status: type === 'error' ? 'error' : 'success'
            });
        }
    }
    async callLLM(prompt) {
        const anthropic = new sdk_1.default({ apiKey: process.env.ANTHROPIC_API_KEY || '' });
        const sys = this.profile.systemPrompt || 'Du bist ein KI-Agent.';
        const response = await anthropic.messages.create({
            model: this.profile.aiModel || 'claude-3-5-sonnet-20241022',
            max_tokens: 8000,
            system: sys,
            messages: [{ role: 'user', content: prompt }]
        });
        let textContent = '';
        if (Array.isArray(response.content)) {
            const block = response.content.find((c) => c.type === 'text');
            textContent = block ? block.text : '';
        }
        else {
            textContent = response.content;
        }
        return textContent.replace(/\x60\x60\x60json/g, '').replace(/\x60\x60\x60/g, '').trim();
    }
    gainExperience() {
        this.profile.level += 1;
        // this.log(`Leveled up to Lvl ${this.profile.level}!`, 'success');
        const hr = new EmployeeService_1.EmployeeService();
        hr.update(this.profile.id, { level: this.profile.level });
    }
}
exports.BaseAgent = BaseAgent;
