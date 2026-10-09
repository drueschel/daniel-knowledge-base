import Anthropic from '@anthropic-ai/sdk';
import { BaseAgent } from './BaseAgent';

export class CalliopeCreativeAgent extends BaseAgent {
  private anthropic: Anthropic;

  constructor(sessionId?: string) {
    super('creative', sessionId);
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    });
  }

  public async writeScript(researchData: any, strategyData: any, qaFeedback?: string) {
    this.log(qaFeedback ? `Überarbeite Skript nach QA-Feedback...` : `Schreibe Skript...`);
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
      
Deine Skripte sind maximal 120 Wörter lang (ca. 45 Sekunden gesprochen).
Du schreibst in einer sehr direkten, umgangssprachlichen Sprache ("Du"-Form). Keine therapeutischen Fachwörter!
Der Text muss emotional fesseln.

WICHTIG: Visuelles Storyboarding (Psychologische Metaphern)
Anstatt nur Fließtext zu liefern, zerlegst du den 'body' zusätzlich in ein didaktisch wertvolles Storyboard.
Anstatt kitschige AI-Avatare oder unpassende Stock-Videos zu planen, denkst du in hochwertigen, abstrakten, aber visuell reichen Metaphern (z.B. organische 2D-Formen, weiche Farbverläufe, glühende Linien, morphing Effekte).
Beispiele für metaphor_type: "CONTACT" (Verbindungslinien), "FUSION" (ineinanderfließende Formen), "AUTONOMY" (klare, abgetrennte Kreise), "TENSION" (zitternde, dünne Linien).

ANTWORTE AUSSCHLIESSLICH IN VALIDEM JSON FORMAT OHNE MARKDOWN BLÖCKE!
ERWARTETES JSON SCHEMA:
{
  "hook_1": "Erster alternativer Hook (max 2 Sätze)",
  "hook_2": "Zweiter alternativer Hook (max 2 Sätze)",
  "hook_3": "Dritter alternativer Hook (max 2 Sätze)",
  "body": "Der Hauptteil des Skripts (max 100 Wörter)",
  "cta": "Der Call-to-Action am Ende (max 2 Sätze)",
  "storyboard": [
    {
      "duration": 5,
      "voiceover_text": "Text-Snippet für diese Szene",
      "metaphor_type": "FUSION",
      "visual_description": "Hochwertige, abstrakte Beschreibung (z.B. Zwei organische, weich leuchtende Formen, die ineinanderfließen, warme reduzierte Farbwelt)"
    }
  ]
}
`;

      let userMessage = `Hier sind die psychologischen Fakten (von Prometheus):
${JSON.stringify(researchData, null, 2)}

Hier ist die strategische Format-Vorgabe (von Athena):
${JSON.stringify(strategyData, null, 2)}
`;

      if (qaFeedback) {
        userMessage += `\nACHTUNG: Themis (Die Quality Assurance) hat dein letztes Skript mit folgendem Feedback ABGELEHNT:\n"${qaFeedback}"\n\nBitte schreibe das Skript komplett neu und behebe diese Mängel!\n`;
      } else {
        userMessage += `\nSchreibe das finale Skript inkl. Storyboard.\n`;
      }

      userMessage += `Gib ein JSON zurück mit den Keys:
- "hook_1", "hook_2", "hook_3"
- "body" und "cta"
- "storyboard" (Array aus Szene-Objekten mit duration, voiceover_text, metaphor_type, visual_description)
Keine anderen Zeichen!`;

      this.log('Sende Script-Anfrage an Claude...');
      console.log('=== SYSTEM PROMPT ===\n', systemPrompt);
      console.log('=== USER MESSAGE ===\n', userMessage);
      const response = await this.anthropic.messages.create({
        model: this.profile.aiModel || 'claude-sonnet-5-5',
        max_tokens: 8000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }]
      });

      const textBlock = response.content.find((b: any) => b.type === 'text') as any;
      const text = textBlock ? textBlock.text : '{}';
      console.log('RAW CLAUDE TEXT:', text);
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      this.activityLogger.log({
        agentId: this.profile.id,
        sessionId: this.currentSessionId,
        action: qaFeedback ? 'Script rewritten' : 'Script written',
        details: `Wrote 3 hooks and body (${(parsed.body || '').split(' ').length} words)`,
        status: 'success',
        model: this.profile.aiModel || 'claude-sonnet-5-5'
      });
      this.gainExperience();

      return parsed;

      
    } catch (error: any) {
      this.log(`Fehler bei Skript-Erstellung: ${error.message}`);
      this.activityLogger.log({
        agentId: this.profile.id,
        sessionId: this.currentSessionId,
        action: 'Script written',
        details: `Error: ${error.message}`,
        status: 'error'
      });
      throw error;
    }
  }
}
