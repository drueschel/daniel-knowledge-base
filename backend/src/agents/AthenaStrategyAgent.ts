import Anthropic from '@anthropic-ai/sdk';
import { BaseAgent } from './BaseAgent';

export class AthenaStrategyAgent extends BaseAgent {
  private anthropic: Anthropic;

  constructor(sessionId?: string) {
    super('strategy', sessionId);
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    });
  }

  public async defineStrategy(researchData: any, targetLength: string = '30s', formatStyle: string = 'auto') {
    this.log(`Definiere Content Strategie...`);
    try {
      // Dynamic HR Prompt injection
      const dynamicRules = `
[Deine Personalakte / Persönlichkeit]
${this.profile.systemPrompt}

[Deine No-Go Liste (Strikt verbote)]
${this.profile.noGoList.map(n => `- ${n}`).join('\n')}

[Deine Learnings / Gedächtnis aus vergangenem Feedback]
${this.profile.memory.map(m => `- ${m}`).join('\n')}
      `;

      let wordLimit = 75;
      if (targetLength === '15s') wordLimit = 35;
      if (targetLength === '60s') wordLimit = 150;

      const systemPrompt = `${dynamicRules}
      
Deine Aufgabe ist es, aus trockenen Fakten ein virales Reel-Format zu definieren.

ZIEL-VORGABEN VOM PRODUZENTEN:
- Dauer: ${targetLength} (Das entspricht ca. ${wordLimit} Wörtern im Skript)
- Gewünschtes Format: ${formatStyle === 'auto' ? 'Du hast völlig freie Wahl (Wähle das Format mit dem höchsten Viralitätspotenzial für dieses Thema)' : formatStyle}

Mögliche Formate (falls du freie Wahl hast): 
- "POV" (Situation aus der Ich-Perspektive)
- "3 harte Wahrheiten" (Listen-Format)
- "Unpopular Opinion" (Kontroverse These)
- "Storytime" (Persönliche Geschichte)

ANTWORTE AUSSCHLIESSLICH IN VALIIDEM JSON FORMAT OHNE MARKDOWN BLÖCKE!`;

      const userMessage = `Hier sind die extrahierten Fakten der Forschung:
${JSON.stringify(researchData, null, 2)}

Definiere die optimale Content-Strategie, um daraus ein virales Video zu machen.
Gib ein JSON zurück mit exakt diesen Keys:
- "format_type" (welches Format hast du gewählt?)
- "visual_style" (z.B. "Kinematische B-Roll von einer erschöpften Person")
- "target_emotion" (welche Emotion soll der Zuschauer am Anfang und Ende fühlen?)
- "music_vibe" (z.B. "Melancholisch, dann aufbauend")
- "word_limit" (Setze hier strikt die Zahl ${wordLimit} ein)
- "target_length" (Setze hier strikt den Wert "${targetLength}" ein)
Keine anderen Zeichen!`;

      this.log('Sende Strategie-Anfrage an Claude...');
      const response = await this.anthropic.messages.create({
        model: this.profile.aiModel || 'claude-sonnet-5-5',
        max_tokens: 8000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }]
      });

      const textBlock = response.content.find((b: any) => b.type === 'text') as any;
      const text = textBlock ? textBlock.text : '{}';
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      this.activityLogger.log({
        agentId: this.profile.id,
        sessionId: this.currentSessionId,
        action: 'Format Strategy defined',
        details: `Chose format: ${parsed.format_type}. Target emotion: ${parsed.target_emotion}`,
        status: 'success',
        model: this.profile.aiModel || 'claude-sonnet-5-5'
      });
      this.gainExperience();

      return parsed;
    } catch (error: any) {
      this.log(`Fehler bei Strategie: ${error.message}`);
      this.activityLogger.log({
        agentId: this.profile.id,
        sessionId: this.currentSessionId,
        action: 'Format Strategy defined',
        details: `Error: ${error.message}`,
        status: 'error'
      });
      throw error;
    }
  }
}
