"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObsidianWriter = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class ObsidianWriter {
    // Hardcoded vault path based on the user's workspace knowledge base structure
    vaultBasePath = '/Users/danielrueschel/DEV/daniel-knowledge-base/src/content/de/YouTube_Imports';
    constructor() {
        // Ensure the target directory exists
        if (!fs_1.default.existsSync(this.vaultBasePath)) {
            fs_1.default.mkdirSync(this.vaultBasePath, { recursive: true });
        }
    }
    saveToVault(filename, content) {
        const filePath = path_1.default.join(this.vaultBasePath, filename);
        fs_1.default.writeFileSync(filePath, content, 'utf8');
        return filePath;
    }
}
exports.ObsidianWriter = ObsidianWriter;
