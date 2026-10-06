import { YoutubeTranscript } from 'youtube-transcript';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { BaseAgent } from './BaseAgent';
import { ObsidianWriter } from '../services/ObsidianWriter';

export class FelixIngestionAgent extends BaseAgent {
  private writer: ObsidianWriter;
  private genAI: GoogleGenerativeAI;

  constructor() {
    super({
      id: 'ingest',
      name: 'Felix',
      role: 'Head of Ingestion',
      level: 1,
      traits: ['Schnell', 'Strukturiert', 'Wissensdurstig']
    });
    this.writer = new ObsidianWriter();
    
    // Initialize Gemini SDK
    const apiKey = process.env.GEMINI_API_KEY || '';
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  public async processYouTubeVideo(url: string): Promise<string> {
    this.log(`Starte Download für Video: ${url}`);
    
    try {
      // 1. Fetch Transcript
      const transcriptChunks = await YoutubeTranscript.fetchTranscript(url);
      const rawText = transcriptChunks.map(chunk => chunk.text).join(' ');
      
      this.log(`Transkript extrahiert (${rawText.length} Zeichen).`);

      // 2. Pass to Gemini for structuring
      const structuredMarkdown = await this.structureWithLLM(rawText, url);

      // 3. Write to Obsidian Vault
      // Clean up the URL to make a safe filename
      const safeName = url.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
      const fileName = `YouTube_${safeName}_${Date.now()}.md`;
      const savedPath = this.writer.saveToVault(fileName, structuredMarkdown);
      
      this.log(`Erfolgreich in Obsidian gespeichert: ${savedPath}`);
      this.gainExperience();

      return savedPath;
    } catch (error: any) {
      this.log(`Fehler beim Ingest-Prozess: ${error.message}`);
      throw error;
    }
  }

  private async structureWithLLM(rawText: string, url: string): Promise<string> {
    this.log(`Sende Daten an Gemini KI zur Strukturierung...`);
    
    try {
      // We use gemini-1.5-flash as it's fast and has a huge context window
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `
Du bist Felix, ein professioneller Daten-Analyst. 
Deine Aufgabe ist es, unstrukturierte, rohe YouTube-Transkripte in sauberes, strukturiertes Markdown für eine Obsidian Knowledge-Base zu übersetzen.

Hier ist das Transkript eines YouTube-Videos (${url}):
---
${rawText.substring(0, 50000)} // Begrenzt auf 50.000 Zeichen zur Sicherheit
---

Bitte erstelle ein professionelles Markdown-Dokument mit folgender Struktur:
1. Eine kurze Einleitung / Zusammenfassung (Was ist die Kernerkenntnis?).
2. "Key Facts & Learnings" (Die wichtigsten psychologischen oder inhaltlichen Fakten als Aufzählungsliste).
3. "Bemerkenswerte Zitate" (Extrahiere 2-3 sehr gute, starke Aussagen direkt aus dem Text und nutze Markdown Blockquotes '>').

Formatiere alles sauber in Deutsch. Sei präzise und wirf irrelevantes Rauschen (Füllwörter, Werbung) weg.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (err: any) {
      this.log(`KI-Fehler: ${err.message}`);
      return `Fehler bei der KI-Zusammenfassung: ${err.message}\n\nRohdaten:\n${rawText.substring(0, 2000)}`;
    }
  }
}
