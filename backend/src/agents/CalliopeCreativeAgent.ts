import { BaseAgent } from './BaseAgent';

export class CalliopeCreativeAgent extends BaseAgent {
  constructor(sessionId: string) {
    super('creative', sessionId);
  }

  async writeScript(research: any, strategy: any, feedback?: string): Promise<any> {
    const prompt = `Du bist Calliope, ein Elite-Scriptwriter für Vertical Video (Instagram Reels/TikTok).
Deine Aufgabe: Schreibe ein fesselndes, konvertierendes Videoskript basierend auf diesen Daten:

Forschung (Prometheus):
${JSON.stringify(research, null, 2)}

Strategie (Athena):
${JSON.stringify(strategy, null, 2)}

${feedback ? `\nFEEDBACK VON DER QA (THEMIS) ZUR ÜBERARBEITUNG:\n${feedback}\nBitte korrigiere das Skript entsprechend!` : ''}

WICHTIG (DER PLAN METHODE):
Wir nutzen den iterativen Plan für Motion-Graphic-Videos.
Das Skript muss zwingend als tabellarische Struktur (JSON Array) aufgebaut sein. Für jeden Satz brauchen wir:
1. Was gesagt wird (voice)
2. Was im Bild zu sehen ist / 3D-Visual (visual)
3. Woher die Aussage kommt / Beleg (source)

Schreibe das finale Skript in folgendem JSON-Format. Keine Markdown-Block-Tags (\`\`\`json), NUR das nackte JSON:
{
  "hook_1": "Option 1: Direkt und schmerzorientiert (max 3 Sekunden gesprochen)",
  "hook_2": "Option 2: Neugier weckend / Story-Einstieg",
  "hook_3": "Option 3: Kontraintuitiv / Provokant",
  "scenes": [
    {
      "voice": "Text, der genau in dieser Szene gesprochen wird.",
      "visual": "Was man sieht. Z.B. 'Ein 3D-Glas-Herz, das pulsiert'. Sei spezifisch.",
      "source": "Fakt/Beleg aus der Forschung."
    },
    ...weitere Szenen...
  ],
  "call_to_action": "Handlungsaufruf am Ende (max 1 Satz)"
}

Regeln:
- Jede 'voice' Aussage muss durch 'source' belegt sein (keine erfundenen Zahlen!).
- Die 'visual' Beschreibungen sollten abstrakte 3D-Metaphern sein (z.B. Glas-Objekte, leuchtende Fäden, verschwommene Partikel).
- Die hooks sind nur der erste Satz. Das Array "scenes" ist der Hauptteil (Body) NACH der Hook.
`;

    this.log('Skript wird geschrieben (Tabelle: Zeit, Stimme, Bild, Beleg)...', 'info', { feedback });
    
    try {
      const response = await this.callLLM(prompt);
      const data = JSON.parse(response);
      return data;
    } catch (error: any) {
      this.log('Fehler beim Schreiben des Skripts', 'error', { error: error.message });
      
      // Fallback
      return {
        hook_1: "Fühlst du dich oft überwältigt?",
        hook_2: "Das Geheimnis innerer Ruhe...",
        hook_3: "Warum Meditation nicht für jeden funktioniert...",
        scenes: [
          {
            "voice": "Oft steckt Trauma tiefer im Nervensystem, als wir denken.",
            "visual": "Ein abstraktes, transluzentes Nervensystem aus leuchtenden lila Fäden.",
            "source": "Neo Emotional Release Methode"
          },
          {
            "voice": "Neo Emotional Release hilft, diese Blockaden somatisch zu lösen.",
            "visual": "Die lila Fäden entspannen sich, ein sanftes cyanblaues Licht durchflutet den Raum.",
            "source": "Erfahrungsberichte"
          }
        ],
        call_to_action: "Klicke den Link in der Bio für mehr Infos."
      };
    }
  }
}
