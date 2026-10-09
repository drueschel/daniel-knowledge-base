"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const router = (0, express_1.Router)();
function getDirectories(srcPath) {
    if (!fs_1.default.existsSync(srcPath))
        return [];
    return fs_1.default.readdirSync(srcPath)
        .filter(file => fs_1.default.statSync(path_1.default.join(srcPath, file)).isDirectory() && !file.startsWith('.'));
}
router.get('/structure', (req, res) => {
    const rootDir = path_1.default.join(__dirname, '../../../src/content/de');
    try {
        const modules = getDirectories(rootDir);
        const structure = modules.map(mod => {
            // Find subdirectories for optgroup
            const subDir1 = getDirectories(path_1.default.join(rootDir, mod));
            let submodules = [];
            // If it's Die_Befreiung, we want the Transkripte_Bibliothek folders
            if (mod === '1_Die_Befreiung' && subDir1.includes('Transkripte_Bibliothek')) {
                const transDirs = getDirectories(path_1.default.join(rootDir, mod, 'Transkripte_Bibliothek'));
                submodules = transDirs.map(t => ({
                    path: `${mod}/Transkripte_Bibliothek/${t}`,
                    name: `↳ Thema: ${t.replace(/^\d+_/, '').replace(/_/g, ' ')}`
                }));
            }
            else {
                submodules = subDir1.map(sub => ({
                    path: `${mod}/${sub}`,
                    name: `↳ ${sub.replace(/^\d+_/, '').replace(/_/g, ' ')}`
                }));
            }
            return {
                id: mod,
                name: mod.replace(/_/g, ' '),
                submodules
            };
        });
        // Sort modules by name
        structure.sort((a, b) => a.name.localeCompare(b.name));
        res.json(structure);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to read directory structure' });
    }
});
exports.default = router;
