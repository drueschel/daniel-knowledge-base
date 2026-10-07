import fs from 'fs';
import path from 'path';
import { BaseAgent } from './BaseAgent';

export class HephaistosVoiceAgent extends BaseAgent {
  constructor(sessionId: string) {
    super(
      'hephaistos',
      'Hephaistos',
      'Chief Audio Engineer',
      'Du bist Hephaistos, der Meister der Akustik. Du bist verantwortlich für Voiceover und Sound-Design.',
      sessionId
    );
  }

  public async generateVoiceover(hookText: string, bodyText: string, ctaText: string): Promise<string> {
    this.logActivity('Voiceover Generierung gestartet', `Sende Skript an ElevenLabs API...`);

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      this.logError('Kein ElevenLabs API Key in .env gefunden!');
      throw new Error('Missing ELEVENLABS_API_KEY');
    }

    // Clean up text: remove bracketed director instructions like [Kamera Zoom]
    const rawText = `${hookText}\n\n${bodyText}\n\n${ctaText}`;
    const cleanText = rawText.replace(/\[.*?\]/g, '').trim();

    try {
      // Voice ID: Adam (standard default for deep male voice)
      const voiceId = 'pNInz6obpgDQGcFmaJgB'; 
      const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'xi-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: cleanText,
          model_id: 'eleven_multilingual_v2', // Good for German!
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`ElevenLabs API Error: ${response.status} - ${errText}`);
      }

      // Convert response stream to buffer
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Save file
      const audioDir = path.join(process.cwd(), 'data', 'audio');
      if (!fs.existsSync(audioDir)) {
        fs.mkdirSync(audioDir, { recursive: true });
      }

      const fileName = `voice_${this.sessionId}.mp3`;
      const filePath = path.join(audioDir, fileName);
      fs.writeFileSync(filePath, buffer);

      const fileUrl = `http://localhost:4000/audio/${fileName}`;

      this.logActivity(
        'Voiceover erfolgreich generiert',
        `Audio-Datei gespeichert: ${fileName} (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`
      );

      return fileUrl;
    } catch (error: any) {
      this.logError(`ElevenLabs API fehlgeschlagen: ${error.message}`);
      throw error;
    }
  }
}
