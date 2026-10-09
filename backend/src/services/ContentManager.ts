import fs from 'fs';
import path from 'path';

export interface ContentPiece {
  id: string;
  topic: string;
  status: 'idea' | 'scripting' | 'review' | 'voiceover' | 'audio_ready' | 'rendering' | 'completed' | 'error';
  researchData?: any;
  strategyData?: any;
  scriptData?: any;
  qaData?: any;
  selectedHook?: string;
  audioUrl?: string;
  videoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export class ContentManager {
  private dbPath: string;

  constructor() {
    this.dbPath = path.join(process.cwd(), 'data', 'content_pieces.json');
    this.ensureDb();
    this.cleanupZombies();
  }

  private cleanupZombies() {
    try {
      const all = this.getAll();
      let changed = false;
      for (const piece of all) {
        if (piece.status === 'scripting' || piece.status === 'rendering' || piece.status === 'voiceover') {
          piece.status = 'error' as any;
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(this.dbPath, JSON.stringify(all, null, 2));
        console.log('[ContentManager] Cleaned up stuck pipeline runs (zombies)');
      }
    } catch (e) {
      console.error(e);
    }
  }

  private ensureDb() {
    if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
      fs.mkdirSync(path.join(process.cwd(), 'data'), { recursive: true });
    }
    if (!fs.existsSync(this.dbPath)) {
      fs.writeFileSync(this.dbPath, JSON.stringify([]));
    }
  }

  public getAll(): ContentPiece[] {
    const data = fs.readFileSync(this.dbPath, 'utf-8');
    return JSON.parse(data);
  }

  public getById(id: string): ContentPiece | undefined {
    return this.getAll().find(p => p.id === id);
  }

  public createOrUpdate(piece: Partial<ContentPiece> & { id: string, topic: string }): ContentPiece {
    const all = this.getAll();
    const existingIndex = all.findIndex(p => p.id === piece.id);
    
    const now = new Date().toISOString();
    
    if (existingIndex >= 0) {
      all[existingIndex] = {
        ...all[existingIndex],
        ...piece,
        updatedAt: now
      };
      fs.writeFileSync(this.dbPath, JSON.stringify(all, null, 2));
      return all[existingIndex];
    } else {
      const newPiece: ContentPiece = {
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
      fs.writeFileSync(this.dbPath, JSON.stringify(all, null, 2));
      return newPiece;
    }
  }

  public delete(id: string) {
    let all = this.getAll();
    all = all.filter(p => p.id !== id);
    fs.writeFileSync(this.dbPath, JSON.stringify(all, null, 2));
  }
}
