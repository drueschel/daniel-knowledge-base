import { BaseAgent } from './BaseAgent';
import { KnowledgeBaseService } from '../services/KnowledgeBaseService';
import Anthropic from '@anthropic-ai/sdk';

export class PrometheusDataAgent extends BaseAgent {
  private kbService: KnowledgeBaseService;
  private anthropic: Anthropic;

  constructor(sessionId?: string) {
    super('data', sessionId); // Matches ID in employees.json
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    });
    this.kbService = new KnowledgeBaseService();
  }

  public async research(prompt: string, researchScope: string = 'kb_and_web', moduleFilter: string = 'all'): Promise<any> {
    this.log(`Analysiere Prompt (Scope: ${researchScope}, Filter: ${moduleFilter})...`);
    
    let contextText = '';
    
    // 1. Dynamic RAG Search (if not web_only)
    if (researchScope === 'kb_only' || researchScope === 'kb_and_web') {
      contextText = await this.kbService.search(prompt, moduleFilter);
      this.log('Knowledge Base erfolgreich durchsucht.');
    } else {
      contextText = "User hat explizit angefordert, NICHT in der Knowledge Base zu suchen. Nutze nur allgemeines Wissen aus dem Internet.";
    }

    let instructionText = '';
    if (researchScope === 'kb_only') {
      instructionText = 'WICHTIG: Nutze AUSSCHLIESSLICH das Wissen aus der bereitgestellten Knowledge Base (GEFUNDENES WISSEN). Erfinde keine externen Fakten hinzu.';
    } else if (researchScope === 'web_only') {
      instructionText = 'WICHTIG: Nutze dein gesamtes Weltwissen / Internet-Trends. Die lokale Knowledge Base wurde ignoriert.';
    } else {
      instructionText = 'Nutze DEIN WISSEN ZU AKTUELLEN TRENDS AUS DEM INTERNET, um das Wissen aus der Datenbank mit dem aktuellen Zeitgeist zu verbinden.';
    }

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

Deine Aufgabe ist es, User-Prompts in harte Social-Media-Fakten zu übersetzen.
${instructionText}
ANTWORTE AUSSCHLIESSLICH IN VALIDEM JSON FORMAT OHNE MARKDOWN BLÖCKE!`;

    const userMessage = `User-Prompt (Was der CEO produzieren will): "${prompt}"

--- GEFUNDENES WISSEN (KNOWLEDGE BASE) ---
${contextText}
---

Extrahiere:
1. core_pain: Was ist das konkrete, gefühlte Problem im Alltag?
2. aha_moment: Was ist die kontraintuitive Einsicht oder harte Wahrheit?
3. solution: Was ist der Lösungsansatz?

Gib ein JSON zurück mit den Keys "core_pain", "aha_moment", "solution". Keine anderen Zeichen!`;

    const response = await this.anthropic.messages.create({
      model: this.profile.aiModel || 'claude-sonnet-5-5',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }]
    });

    let textContent = '';
    if (Array.isArray(response.content)) {
      const block = response.content.find((c: any) => c.type === 'text');
      textContent = block ? (block as any).text : '';
    } else {
      textContent = response.content as unknown as string;
    }

    let cleanJson = textContent.replace(/```json/g, '').replace(/```/g, '').trim();
    
    try {
      const parsed = JSON.parse(cleanJson);
      this.log(`Recherche (${researchScope}) erfolgreich extrahiert.`, 'success', parsed);
      return parsed;
    } catch (e) {
      this.log('Fehler beim Parsen', 'error', { text: textContent });
      throw new Error("Prometheus's output was not valid JSON");
    }
  }
}
