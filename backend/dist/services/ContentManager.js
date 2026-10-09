"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentManager = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class ContentManager {
    dbPath;
    constructor() {
        this.dbPath = path_1.default.join(process.cwd(), 'data', 'content_pieces.json');
        this.ensureDb();
        this.cleanupZombies();
    }
    cleanupZombies() {
        try {
            const all = this.getAll();
            let changed = false;
            for (const piece of all) {
                if (piece.status === 'scripting' || piece.status === 'rendering' || piece.status === 'voiceover' || piece.status === 'visuals') {
                    piece.status = 'error';
                    changed = true;
                }
            }
            if (changed) {
                fs_1.default.writeFileSync(this.dbPath, JSON.stringify(all, null, 2));
                console.log('[ContentManager] Marked stuck pipeline runs (zombies) as error');
            }
        }
        catch (e) {
            console.error(e);
        }
    }
    ensureDb() {
        if (!fs_1.default.existsSync(path_1.default.join(process.cwd(), 'data'))) {
            fs_1.default.mkdirSync(path_1.default.join(process.cwd(), 'data'), { recursive: true });
        }
        if (!fs_1.default.existsSync(this.dbPath)) {
            fs_1.default.writeFileSync(this.dbPath, JSON.stringify([]));
        }
    }
    getAll() {
        const data = fs_1.default.readFileSync(this.dbPath, 'utf-8');
        return JSON.parse(data);
    }
    getById(id) {
        return this.getAll().find(p => p.id === id);
    }
    createOrUpdate(piece) {
        const all = this.getAll();
        const existingIndex = all.findIndex(p => p.id === piece.id);
        const now = new Date().toISOString();
        if (existingIndex >= 0) {
            all[existingIndex] = {
                ...all[existingIndex],
                ...piece,
                updatedAt: now
            };
            fs_1.default.writeFileSync(this.dbPath, JSON.stringify(all, null, 2));
            return all[existingIndex];
        }
        else {
            const newPiece = {
                status: 'scripting',
                researchData: null,
                strategyData: null,
                scriptData: null,
                qaData: null,
                ...piece,
                createdAt: now,
                updatedAt: now
            };
            all.push(newPiece);
            fs_1.default.writeFileSync(this.dbPath, JSON.stringify(all, null, 2));
            return newPiece;
        }
    }
    delete(id) {
        console.trace('[ContentManager] Delete called for', id);
        let all = this.getAll();
        all = all.filter(p => p.id !== id);
        fs_1.default.writeFileSync(this.dbPath, JSON.stringify(all, null, 2));
    }
}
exports.ContentManager = ContentManager;
