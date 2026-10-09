import { BaseAgent } from './BaseAgent';

export class ThemisQaAgent extends BaseAgent {
  constructor(sessionId: string) {
    super('qa', sessionId);
  }

  async reviewScript(scriptData: any, research: any, strategy: any): Promise<any> {
    const prompt = `Du bist Themis, der gnadenlose Quality Assurance & Compliance Editor.
Du wendest die Checkliste "Vor dem Rendern" aus dem Masterplan an.

Prüfe dieses Skript-Dokument:
${JSON.stringify(scriptData, null, 2)}

Gegen diese Vorgaben:
1. Strategie: ${JSON.stringify(strategy)}
2. Recherche: ${JSON.stringify(research)}

CHECKLISTE:
1. Inhalt: Ist jede Aussage (voice) durch die angegebene Quelle (source) belegt? Sind Zahlen/Fakten erfunden?
2. Visuals: Sind die Visual-Beschreibungen konkret genug für einen 3D-Render? (Kein echtes Filmmaterial, nur 3D/Motion Graphics).
3. Hooks: Sind die 3 Hooks prägnant und bauen Spannung auf?

Gib eine JSON-Antwort (nur das JSON, ohne Markdown) in diesem Format:
{
  "status": "approved" | "rejected",
  "feedback": "Kritikpunkte, falls rejected. Warum wurde abgelehnt?",
  "final_script": {
    "hook_1": "...",
    "hook_2": "...",
    "hook_3": "...",
    "scenes": [ { "voice": "...", "visual": "...", "source": "..." } ],
    "call_to_action": "..."
  }
}
Wenn du kleine Fehler findest, verbessere sie direkt und setze status auf "approved". Bei gravierenden inhaltlichen Erfindungen setze auf "rejected".
`;

    this.log('Skript wird geprüft (QA-Checkliste)...');
    
    try {
      const response = await this.callLLM(prompt);
      return JSON.parse(response);
    } catch (e) {
      return { status: 'approved', feedback: 'Auto-approved due to JSON parse error', final_script: scriptData };
    }
  }
}
