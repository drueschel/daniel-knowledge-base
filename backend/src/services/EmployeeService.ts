import fs from 'fs';
import path from 'path';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const DB_PATH = path.join(__dirname, '../../data/employees.json');

export interface Employee {
  id: string;
  name: string;
  role: string;
  avatar: string;
  level: number;
  systemPrompt: string;
  noGoList: string[];
  memory: string[];
  traits: string[];
  performance: number;
  stats: string;
  description: string;
  color: string;
  aiModel?: string;
}

export class EmployeeService {
  private readDB(): Employee[] {
    if (!fs.existsSync(DB_PATH)) return [];
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  }

  private writeDB(data: Employee[]) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  }

  public getAll(): Employee[] {
    return this.readDB();
  }

  public getById(id: string): Employee | undefined {
    return this.readDB().find(e => e.id === id);
  }

  public update(id: string, updates: Partial<Employee>): Employee {
    const db = this.readDB();
    const index = db.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Employee not found');
    
    db[index] = { ...db[index], ...updates };
    this.writeDB(db);
    return db[index];
  }

  // The AI training loop!
  public async processFeedback(id: string, feedback: string): Promise<Employee> {
    const employee = this.getById(id);
    if (!employee) throw new Error('Employee not found');

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
      ? (response.content.find((c: any) => c.type === 'text') as any)?.text || ''
      : response.content as unknown as string;
      
    let cleanJson = textContent.replace(/```json/g, '').replace(/```/g, '').trim();
    
    try {
      const parsed = JSON.parse(cleanJson);
      if (parsed.type === 'nogo') {
        employee.noGoList.push(parsed.rule);
      } else {
        employee.memory.push(parsed.rule);
      }
      
      return this.update(id, { noGoList: employee.noGoList, memory: employee.memory });
    } catch (e) {
      console.error("Fehler beim Verarbeiten des Feedbacks", e);
      throw new Error("Konnte das Feedback nicht in eine Regel übersetzen.");
    }
  }
}
