import { BaseAgent } from './BaseAgent';
import { MayaVisualAgent } from './MayaVisualAgent';

export class UgcDirectorAgent extends BaseAgent {
  constructor(sessionId: string) {
    super('production', sessionId); // Reuse 'production' profile for simplicity, but override name
    this.profile.name = 'Stanley (UGC Director)';
    this.profile.systemPrompt = `Du bist ein professioneller Video-Editor und Regisseur für Social Media Reels.
Deine Aufgabe ist es, einen UGC-Monolog (ein Video, in dem der User spricht) in dynamische Schnitte zu unterteilen.
Mache einen Mix aus A-Roll (Man sieht das echte Video des Users) und B-Roll (KI generierte Metaphern/Clips passend zum Text).
Gebe exakt ein JSON Array zurück, das die Szenen beschreibt. Format:
[
  { "voice": "Hier ist der exakte Satz aus dem Transkript", "type": "ugc", "visual_instruction": "Originales Video" },
  { "voice": "Hier ist der nächste Satz", "type": "b-roll", "visual_instruction": "Beschreibung des KI-Bildes, z.B. Ein glühendes Gehirn, fotorealistisch" },
  ...
]
Regeln:
- Der erste Clip (Hook) MUSS immer "type": "ugc" sein, damit das Video mit dem Gesicht des Users startet!
- Die voice Texte müssen exakt zusammenhängend das Original-Transkript ergeben (keine Lücken!).
- Wechsel sinnvoll zwischen ugc und b-roll (ca. 40% B-Roll).
Antworte AUSSCHLIESSLICH mit gültigem JSON, ohne Markdown-Blöcke.`;
  }

  async planStoryboard(transcript: string, ugcVideoUrl: string): Promise<any[]> {
    this.log('Analysiere Transkript und plane A-Roll/B-Roll Schnitte...');
    
    const prompt = `Hier ist das Transkript des Videos:\n\n${transcript}\n\nBitte erstelle das JSON-Storyboard (A-Roll / B-Roll).`;
    const jsonStr = await this.callLLM(prompt);
    
    let scenes = [];
    try {
      scenes = JSON.parse(jsonStr);
    } catch (e) {
      this.log('Fehler beim Parsen des JSONs, nutze Fallback (100% UGC)', 'error');
      return [{
        id: 0,
        voice: transcript,
        type: 'ugc',
        visual_instruction: 'Originales Video'
      }];
    }
    
    this.log(`Stanley hat ${scenes.length} Szenen geplant. Warte auf User-Freigabe...`, 'success');
    return scenes.map((s: any, i: number) => ({
      id: i,
      voice: s.voice,
      type: s.type || 'ugc',
      visual_instruction: s.visual_instruction || 'Originales Video',
      imageUrl: s.type === 'ugc' ? `http://localhost:4000${ugcVideoUrl}` : null
    }));
  }
}
