import fs from 'fs';
import path from 'path';
import { BaseAgent } from './BaseAgent';

export class HephaistosVoiceAgent extends BaseAgent {
  private sessionId: string;
  constructor(sessionId: string) {
    super('production', sessionId);
    this.sessionId = sessionId;
  }

  public async generateVoiceover(hookText: string, bodyText: string, ctaText: string): Promise<string> {
    this.log('Voiceover Generierung gestartet', 'info', { details: 'Sende Skript an ElevenLabs API...' });

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      this.log('Kein ElevenLabs API Key in .env gefunden!', 'error');
      throw new Error('Missing ELEVENLABS_API_KEY');
    }

    // Clean up text: remove bracketed director instructions like [Kamera Zoom]
    const rawText = `${hookText}\n\n${bodyText}\n\n${ctaText}`;
    const cleanText = rawText.replace(/\[.*?\]/g, '').trim();

    try {
      // Voice ID: Adam (standard default for deep male voice)
      const voiceId = 'IKne3meq5aSn9XLyUdCD'; // Charlie - sehr natürlich, gesprächig, leichte Atemgeräusche (Dein Account-Limit erlaubt keine Custom/Library Voices!) 
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
            stability: 0.35, // Niedriger = mehr Emotion und Betonungsvarianz (weniger Roboter)
            similarity_boost: 0.85,
            style: 0.15, // Gibt dem Multilingual-v2 Modell etwas mehr Ausdruckskraft
            use_speaker_boost: true
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

      this.log('Voiceover erfolgreich generiert', 'success', { fileName, sizeMB: (buffer.length / 1024 / 1024).toFixed(2) });

      return fileUrl;
    } catch (error: any) {
      this.log(`ElevenLabs API fehlgeschlagen: ${error.message}`, 'error');
      throw error;
    }
  }
}
