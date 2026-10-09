"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const anthropic = new sdk_1.default({
    apiKey: process.env.ANTHROPIC_API_KEY
});
const DB_PATH = path_1.default.join(__dirname, '../../data/employees.json');
class EmployeeService {
    readDB() {
        if (!fs_1.default.existsSync(DB_PATH))
            return [];
        return JSON.parse(fs_1.default.readFileSync(DB_PATH, 'utf-8'));
    }
    writeDB(data) {
        fs_1.default.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    }
    getAll() {
        return this.readDB();
    }
    getById(id) {
        return this.readDB().find(e => e.id === id);
    }
    update(id, updates) {
        const db = this.readDB();
        const index = db.findIndex(e => e.id === id);
        if (index === -1)
            throw new Error('Employee not found');
        db[index] = { ...db[index], ...updates };
        this.writeDB(db);
        return db[index];
    }
    // The AI training loop!
    async processFeedback(id, feedback) {
        const employee = this.getById(id);
        if (!employee)
            throw new Error('Employee not found');
        const prompt = `Du bist ein AI-HR Manager. Du erhältst Feedback vom CEO für den KI-Mitarbeiter "${employee.name}" (Rolle: ${employee.role}).
    
CEO-Feedback: "${feedback}"
    
Deine Aufgabe: Extrahiere aus diesem Feedback EINE präzise, dauerhafte Arbeitsregel ("Learning" / "Memory") für diesen Mitarbeiter, die in Zukunft IMMER beachtet werden muss.
Formuliere die Regel in der Ich-Perspektive oder als direkten Befehl an den Agenten. Halt es extrem kurz (max 1 Satz). 
Wenn es ein hartes Verbot ist (No-Go), formuliere es explizit als Verbot.

Antworte AUSSCHLIESSLICH mit einem JSON:
{
  "type": "learning" | "nogo",
  "rule": "..."
}`;
        const response = await anthropic.messages.create({
            model: 'claude-haiku-4-5',
            max_tokens: 200,
            system: 'Antworte nur in JSON.',
            messages: [{ role: 'user', content: prompt }]
        });
        let textContent = Array.isArray(response.content)
            ? response.content.find((c) => c.type === 'text')?.text || ''
            : response.content;
        let cleanJson = textContent.replace(/```json/g, '').replace(/```/g, '').trim();
        try {
            const parsed = JSON.parse(cleanJson);
            if (parsed.type === 'nogo') {
                employee.noGoList.push(parsed.rule);
            }
            else {
                employee.memory.push(parsed.rule);
            }
            return this.update(id, { noGoList: employee.noGoList, memory: employee.memory });
        }
        catch (e) {
            console.error("Fehler beim Verarbeiten des Feedbacks", e);
            throw new Error("Konnte das Feedback nicht in eine Regel übersetzen.");
        }
    }
}
exports.EmployeeService = EmployeeService;
