"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeBaseService = void 0;
const glob_1 = require("glob");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const anthropic = new sdk_1.default({
    apiKey: process.env.ANTHROPIC_API_KEY,
});
class KnowledgeBaseService {
    contentDir;
    constructor() {
        this.contentDir = path_1.default.join(process.cwd(), '../src/content/de');
    }
    // Gets a manifest of all available MD files (path + title)
    async buildManifest(moduleFilter) {
        const files = await (0, glob_1.glob)('**/*.md', { cwd: this.contentDir });
        let manifest = '';
        for (const file of files) {
            if (moduleFilter !== 'all' && !file.includes(moduleFilter)) {
                continue;
            }
            const fullPath = path_1.default.join(this.contentDir, file);
            const content = fs_1.default.readFileSync(fullPath, 'utf-8');
            const lines = content.split('\n');
            const titleLine = lines.find(l => l.startsWith('# ')) || file;
            manifest += `[ID: ${file}] Title: ${titleLine.replace('# ', '').trim()}\n`;
        }
        return manifest;
    }
    // Searches the KB using LLM to pick the best files for a prompt
    async search(prompt, moduleFilter = 'all') {
        const manifest = await this.buildManifest(moduleFilter);
        // Use Claude as an intelligent Retriever
        const response = await anthropic.messages.create({
            model: "claude-sonnet-5-5",
            max_tokens: 200,
            system: `Du bist ein Retrieval-Agent für Daniels Knowledge Base. 
Gegeben ist ein User-Prompt und eine Liste aller verfügbaren Dokumente.
Entscheide, welche 1-3 Dokumente am relevantesten für den Prompt sind.
Gib AUSSCHLIESSLICH die IDs der Dokumente als kommagetrennte Liste zurück. Keine Erklärungen.`,
            messages: [
                {
                    role: "user",
                    content: `User Prompt: "${prompt}"\n\nVerfügbare Dokumente:\n${manifest}`
                }
            ]
        });
        let textContent = '';
        if (Array.isArray(response.content) && response.content.length > 0) {
            textContent = response.content[0].text || '';
        }
        else if (typeof response.content === 'string') {
            textContent = response.content;
        }
        const selectedIdsStr = textContent.trim();
        const selectedIds = selectedIdsStr.split(',').map((id) => id.trim()).filter((id) => id.length > 0);
        let combinedContent = `RECHERCHE-ERGEBNISSE FÜR PROMPT: "${prompt}"\n\n`;
        let foundCount = 0;
        for (const id of selectedIds) {
            if (!id)
                continue;
            const fullPath = path_1.default.join(this.contentDir, id);
            if (fs_1.default.existsSync(fullPath)) {
                const content = fs_1.default.readFileSync(fullPath, 'utf-8');
                combinedContent += `--- QUELLE: ${id} ---\n${content}\n\n`;
                foundCount++;
            }
        }
        if (foundCount === 0) {
            return `Keine spezifischen Dokumente gefunden. Bitte basiere deine Analyse auf allgemeinem psychologischem Wissen zu diesem Thema: ${prompt}`;
        }
        return combinedContent;
    }
}
exports.KnowledgeBaseService = KnowledgeBaseService;
