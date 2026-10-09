"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityLogger = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class ActivityLogger {
    logFile;
    constructor() {
        this.logFile = path_1.default.join(process.cwd(), 'data', 'activity_log.json');
        this.ensureLogFile();
    }
    ensureLogFile() {
        const dir = path_1.default.dirname(this.logFile);
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
        if (!fs_1.default.existsSync(this.logFile)) {
            fs_1.default.writeFileSync(this.logFile, JSON.stringify([]));
        }
    }
    log(entry) {
        try {
            const current = JSON.parse(fs_1.default.readFileSync(this.logFile, 'utf-8'));
            const newEntry = {
                ...entry,
                id: Math.random().toString(36).substring(2, 9),
                timestamp: new Date().toISOString()
            };
            current.unshift(newEntry);
            // Keep only last 100 entries
            fs_1.default.writeFileSync(this.logFile, JSON.stringify(current.slice(0, 100), null, 2));
        }
        catch (e) {
            console.error("Failed to write activity log:", e);
        }
    }
    getLogs(agentId) {
        try {
            const current = JSON.parse(fs_1.default.readFileSync(this.logFile, 'utf-8'));
            if (agentId) {
                return current.filter((log) => log.agentId === agentId);
            }
            return current;
        }
        catch (e) {
            return [];
        }
    }
    clearLogs() {
        try {
            fs_1.default.writeFileSync(this.logFile, JSON.stringify([]));
        }
        catch (e) {
            console.error("Failed to clear activity log:", e);
        }
    }
}
exports.ActivityLogger = ActivityLogger;
