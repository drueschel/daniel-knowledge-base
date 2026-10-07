import Anthropic from '@anthropic-ai/sdk';
import { BaseAgent } from './BaseAgent';

export class ThemisQaAgent extends BaseAgent {
  private anthropic: Anthropic;

  constructor(sessionId?: string) {
    super('qa', sessionId);
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    });
  }

  public async reviewScript(scriptData: any, researchData: any, strategyData: any) {
    this.log(`Führe QA Check durch...`);
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

      const systemPrompt = `${dynamicRules}
      
Du bist die erbarmungslose Lektorin und Quality Assurance. Dein Job ist es sicherzustellen, dass:
1. Das Skript nicht zu lang ist (Body maximal 100-120 Wörter).
2. Die Kernfakten (Pain Point, Aha-Moment) von Prometheus korrekt repräsentiert sind.
3. Die Hooks nicht Cringe klingen und Neugier wecken.
4. Der Text emotional ansprechend ist.

Du veränderst das Skript NICHT selbst! Wenn es Mängel gibt, lehnst du es ab (Status "rejected") und schreibst eine klare Kritik an die Autorin Calliope (Feedback).
Wenn alles passt, setzt du den Status auf "approved" und lässt das Feedback leer oder gibst kurzes Lob.

ANTWORTE AUSSCHLIESSLICH IN VALIDEM JSON FORMAT OHNE MARKDOWN BLÖCKE!`;

      const userMessage = `Hier sind die ursprünglichen Fakten von Prometheus:
${JSON.stringify(researchData, null, 2)}

Hier ist das Skript von Calliope:
${JSON.stringify(scriptData, null, 2)}

Prüfe das Skript.
Gib ein JSON zurück mit den Keys:
- "status": "approved" oder "rejected"
- "feedback": (Deine Kritik an Calliope, falls rejected. Muss klar benennen, was sie ändern soll.)
Keine anderen Zeichen!`;

      this.log('Sende QA-Anfrage an Claude...');
      const response = await this.anthropic.messages.create({
        model: this.profile.aiModel || 'claude-sonnet-5-5',
        max_tokens: 2000,
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
        action: 'QA Review',
        details: `Status: ${parsed.status}. Feedback: ${parsed.feedback}`,
        status: parsed.status === 'approved' ? 'success' : 'warning',
        model: this.profile.aiModel || 'claude-sonnet-5-5'
      });
      this.gainExperience();

      return parsed;
    } catch (error: any) {
      this.log(`Fehler bei QA: ${error.message}`);
      this.activityLogger.log({
        agentId: this.profile.id,
        sessionId: this.currentSessionId,
        action: 'QA Review',
        details: `Error: ${error.message}`,
        status: 'error'
      });
      throw error;
    }
  }
}
