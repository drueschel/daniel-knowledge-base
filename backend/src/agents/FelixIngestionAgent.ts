import { YoutubeTranscript } from 'youtube-transcript';
import { BaseAgent } from './BaseAgent';
import { ObsidianWriter } from '../services/ObsidianWriter';

export class FelixIngestionAgent extends BaseAgent {
  private writer: ObsidianWriter;

  constructor() {
    super({
      id: 'ingest',
      name: 'Felix',
      role: 'Head of Ingestion',
      level: 1,
      traits: ['Schnell', 'Strukturiert', 'Wissensdurstig']
    });
    this.writer = new ObsidianWriter();
  }

  public async processYouTubeVideo(url: string): Promise<string> {
    this.log(`Starte Download für Video: ${url}`);
    
    try {
      // 1. Fetch Transcript
      const transcriptChunks = await YoutubeTranscript.fetchTranscript(url);
      const rawText = transcriptChunks.map(chunk => chunk.text).join(' ');
      
      this.log(`Transkript extrahiert (${rawText.length} Zeichen).`);

      // 2. Pass to LLM for structuring (Mocked if no API key)
      const structuredMarkdown = await this.structureWithLLM(rawText);

      // 3. Write to Obsidian Vault
      const fileName = `YouTube_Import_${Date.now()}.md`;
      const savedPath = this.writer.saveToVault(fileName, structuredMarkdown);
      
      this.log(`Erfolgreich in Obsidian gespeichert: ${savedPath}`);
      this.gainExperience();

      return savedPath;
    } catch (error: any) {
      this.log(`Fehler beim Ingest-Prozess: ${error.message}`);
      throw error;
    }
  }

  private async structureWithLLM(rawText: string): Promise<string> {
    this.log(`Sende Daten an LLM zur Strukturierung...`);
    
    // TODO: Replace with real OpenAI/Anthropic call once API keys are provided.
    // For now, simulate the AI processing and structuring.
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`
# YouTube Video Import
**Datum:** ${new Date().toISOString()}

## 1. Zusammenfassung
Dieses Dokument wurde automatisch von Agent Felix strukturiert. Es enthält die Kernessenz des Videos.

## 2. Key Facts & Learnings
- **Fakt 1:** Automatische Extraktion funktioniert.
- **Fakt 2:** Rauschen und Füllwörter wurden vom LLM entfernt.

## 3. Bemerkenswerte Zitate
> "Das ist ein simuliertes Zitat aus dem rohen Transkript."

## Rohdaten (Auszug)
${rawText.substring(0, 300)}...
        `.trim());
      }, 1500);
    });
  }
}
