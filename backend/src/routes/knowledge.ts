import { Router } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();

function getDirectories(srcPath: string): string[] {
  if (!fs.existsSync(srcPath)) return [];
  return fs.readdirSync(srcPath)
    .filter(file => fs.statSync(path.join(srcPath, file)).isDirectory() && !file.startsWith('.'));
}

router.get('/structure', (req, res) => {
  const rootDir = path.join(__dirname, '../../../src/content/de');
  
  try {
    const modules = getDirectories(rootDir);
    const structure = modules.map(mod => {
      // Find subdirectories for optgroup
      const subDir1 = getDirectories(path.join(rootDir, mod));
      let submodules: { path: string; name: string }[] = [];
      
      // If it's Die_Befreiung, we want the Transkripte_Bibliothek folders
      if (mod === '1_Die_Befreiung' && subDir1.includes('Transkripte_Bibliothek')) {
        const transDirs = getDirectories(path.join(rootDir, mod, 'Transkripte_Bibliothek'));
        submodules = transDirs.map(t => ({
          path: `${mod}/Transkripte_Bibliothek/${t}`,
          name: `↳ Thema: ${t.replace(/^\d+_/, '').replace(/_/g, ' ')}`
        }));
      } else {
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to read directory structure' });
  }
});

export default router;
