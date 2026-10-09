import { glob } from 'glob';
import fs from 'fs';
import path from 'path';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export class KnowledgeBaseService {
  private contentDir: string;

  constructor() {
    this.contentDir = path.join(process.cwd(), '../src/content/de');
  }

  // Gets a manifest of all available MD files (path + title)
  private async buildManifest(moduleFilter: string): Promise<string> {
    const files = await glob('**/*.md', { cwd: this.contentDir });
    let manifest = '';
    
    for (const file of files) {
      if (moduleFilter !== 'all' && !file.includes(moduleFilter)) {
        continue;
      }
      
      const fullPath = path.join(this.contentDir, file);
      const content = fs.readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n');
      const titleLine = lines.find(l => l.startsWith('# ')) || file;
      manifest += `[ID: ${file}] Title: ${titleLine.replace('# ', '').trim()}\n`;
    }
    return manifest;
  }

  // Searches the KB using LLM to pick the best files for a prompt
  public async search(prompt: string, moduleFilter: string = 'all'): Promise<string> {
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
      textContent = (response.content[0] as any).text || '';
    } else if (typeof response.content === 'string') {
      textContent = response.content;
    }
    const selectedIdsStr = textContent.trim();
    const selectedIds = selectedIdsStr.split(',').map((id: string) => id.trim()).filter((id: string) => id.length > 0);
    
    let combinedContent = `RECHERCHE-ERGEBNISSE FÜR PROMPT: "${prompt}"\n\n`;
    
    let foundCount = 0;
    for (const id of selectedIds) {
      if (!id) continue;
      const fullPath = path.join(this.contentDir, id);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
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
