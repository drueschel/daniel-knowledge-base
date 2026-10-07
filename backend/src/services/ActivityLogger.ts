import fs from 'fs';
import path from 'path';

export interface ActivityEntry {
  id: string;
  agentId: string;
  action: string;
  details: string;
  timestamp: string;
  sessionId?: string;
  status: 'success' | 'error';
  model?: string;
  cost?: number;
}

export class ActivityLogger {
  private logFile: string;

  constructor() {
    this.logFile = path.join(process.cwd(), 'data', 'activity_log.json');
    this.ensureLogFile();
  }

  private ensureLogFile() {
    const dir = path.dirname(this.logFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(this.logFile)) {
      fs.writeFileSync(this.logFile, JSON.stringify([]));
    }
  }

  public log(entry: Omit<ActivityEntry, 'id' | 'timestamp'>) {
    try {
      const current = JSON.parse(fs.readFileSync(this.logFile, 'utf-8'));
      const newEntry: ActivityEntry = {
        ...entry,
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString()
      };
      current.unshift(newEntry);
      // Keep only last 100 entries
      fs.writeFileSync(this.logFile, JSON.stringify(current.slice(0, 100), null, 2));
    } catch (e) {
      console.error("Failed to write activity log:", e);
    }
  }

  public getLogs(agentId?: string): ActivityEntry[] {
    try {
      const current = JSON.parse(fs.readFileSync(this.logFile, 'utf-8'));
      if (agentId) {
        return current.filter((log: ActivityEntry) => log.agentId === agentId);
      }
      return current;
    } catch (e) {
      return [];
    }
  }

  public clearLogs() {
    try {
      fs.writeFileSync(this.logFile, JSON.stringify([]));
    } catch (e) {
      console.error("Failed to clear activity log:", e);
    }
  }
}
