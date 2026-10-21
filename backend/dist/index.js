"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); // MUST BE FIRST
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const ingest_1 = __importDefault(require("./routes/ingest"));
const agents_1 = __importDefault(require("./routes/agents"));
const studio_1 = __importDefault(require("./routes/studio"));
const content_1 = __importDefault(require("./routes/content"));
const knowledge_1 = __importDefault(require("./routes/knowledge"));
const activity_1 = __importDefault(require("./routes/activity"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const path_1 = __importDefault(require("path"));
// Serve audio files statically
app.use('/audio', express_1.default.static(path_1.default.join(__dirname, '..', 'data', 'audio')));
app.use('/outputs', express_1.default.static(path_1.default.join(__dirname, '..', 'public', 'outputs')));
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '..', 'data', 'uploads')));
app.use('/data', express_1.default.static(path_1.default.join(__dirname, '..', 'data')));
// Routes
app.use('/api/ingest', ingest_1.default);
app.use('/api/agents', agents_1.default);
app.use('/api/studio', studio_1.default);
app.use('/api/content', content_1.default);
app.use('/api/knowledge', knowledge_1.default);
app.use('/api/activity', activity_1.default);
const employees_1 = __importDefault(require("./routes/employees"));
const tavus_1 = __importDefault(require("./routes/tavus"));
app.use('/api/employees', employees_1.default);
app.use('/api/tavus', tavus_1.default);
// Healthcheck
app.get('/health', (req, res) => {
    res.json({ status: 'Agentic Backend is running.', version: '1.0.0' });
});
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`[Server] Agentic Backend listening on port ${PORT}`);
});
