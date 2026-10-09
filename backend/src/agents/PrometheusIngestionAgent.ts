import { YoutubeTranscript } from 'youtube-transcript';
import Anthropic from '@anthropic-ai/sdk';
import { BaseAgent } from './BaseAgent';
import { ObsidianWriter } from '../services/ObsidianWriter';

export class PrometheusIngestionAgent extends BaseAgent {
  private writer: ObsidianWriter;
  private anthropic: Anthropic;

  constructor(sessionId?: string) {
    super('data', sessionId);
    this.writer = new ObsidianWriter();
    const apiKey = process.env.ANTHROPIC_API_KEY || '';
    this.anthropic = new Anthropic({
      apiKey: apiKey,
    });
  }

  public async processYouTubeVideo(url: string): Promise<string> {
    this.log(`Starte Download für Video: ${url}`);
    
    try {
      const transcriptChunks = await YoutubeTranscript.fetchTranscript(url);
      const rawText = transcriptChunks.map(chunk => chunk.text).join(' ');
      
      this.log(`Transkript extrahiert (${rawText.length} Zeichen).`);
      const structuredMarkdown = await this.structureWithLLM(rawText, url);

      const safeName = url.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
      const fileName = `YouTube_${safeName}_${Date.now()}.md`;
      const savedPath = this.writer.saveToVault(fileName, structuredMarkdown);
      
      this.log(`Erfolgreich in Obsidian gespeichert: ${savedPath}`);
      this.activityLogger.log({
        agentId: this.profile.id,
        sessionId: this.currentSessionId,
        action: 'YouTube Ingest & Structure',
        details: `Processed video ${url} (${rawText.length} chars). Saved to ${fileName}`,
        status: 'success',
        model: this.profile.aiModel || 'claude-sonnet-5-5'
      });
      this.gainExperience();

      return savedPath;
    } catch (error: any) {
      this.log(`Fehler beim Ingest-Prozess: ${error.message}`);
      this.activityLogger.log({
        agentId: this.profile.id,
        sessionId: this.currentSessionId,
        action: 'YouTube Ingest',
        details: `Error: ${error.message}`,
        status: 'error'
      });
      throw error;
    }
  }

  private async structureWithLLM(rawText: string, url: string): Promise<string> {
    this.log(`Bereite Text vor... Dank Claude können wir jetzt auch 100k+ Zeichen verarbeiten!`);
    
    // Mit Claude Sonnet können wir das ganze Transkript nehmen (bis ca. 150.000 Zeichen entspannt).
    // Zur Sicherheit kappen wir bei 200.000, falls ein Video mal 3 Stunden geht.
    const truncatedText = rawText.substring(0, 200000); 

    const systemPrompt = `Du bist Prometheus, ein professioneller Daten-Analyst. 
Deine Aufgabe ist es, YouTube-Transkripte in sauberes, strukturiertes Markdown für eine Obsidian Knowledge-Base zu übersetzen.`;

    const userMessage = `Hier ist das Transkript eines YouTube-Videos (${url}):
---
${truncatedText}
---

Bitte erstelle ein professionelles Markdown-Dokument mit folgender Struktur:
# Zusammenfassung: [Titel aus Kontext ableiten]
1. Eine kurze Einleitung / Zusammenfassung (Was ist die Kernerkenntnis?).
2. **Key Facts & Learnings** (Die wichtigsten psychologischen oder inhaltlichen Fakten als Aufzählungsliste).
3. **Bemerkenswerte Zitate** (Extrahiere 2-3 sehr gute, starke Aussagen direkt aus dem Text und nutze Markdown Blockquotes '>').

Formatiere alles sauber in Deutsch. Verhalte dich wie ein hochprofessioneller Analyst. Antworte NUR mit dem finalen Markdown-Text, ohne "Hier ist deine Zusammenfassung" oder ähnliches.`;

    try {
      const modelName = "claude-3-5-sonnet-20241022"; 
      this.log(`Versuche Modell: ${modelName}`);
      
      const response = await this.anthropic.messages.create({
        model: modelName,
        max_tokens: 8192,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userMessage }
        ]
      });

      this.log(`Erfolgreich mit Modell: ${modelName}!`);
      // Der Text steckt im content array an Position 0
      const textBlock = response.content.find((b: any) => b.type === 'text') as any;
      const llmSummary = textBlock ? textBlock.text : '';
      
      const fullMarkdown = `${llmSummary}\n\n---\n\n<details>\n<summary>Original Transkript (Rohdaten)</summary>\n\n${rawText}\n</details>`;
      
      return fullMarkdown;
    } catch (err: any) {
      this.log(`Fehler mit KI: ${err.message}`);
      return `# Fehler bei der KI-Zusammenfassung\n\nDie KI hat einen Fehler zurückgegeben: ${err.message}\n\n## Rohdaten:\n\n${truncatedText.substring(0, 10000)}...`;
    }
  }
}
