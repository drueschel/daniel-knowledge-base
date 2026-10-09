import { BaseAgent } from './BaseAgent';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';

const execAsync = promisify(exec);

export class HephaistosVoiceAgent extends BaseAgent {
  constructor(sessionId: string) {
    super('production', sessionId, 'Hephaistos (Audio & Voice)');
  }

  async generateVoiceover(hookText: string, scenes: any[], ctaText: string): Promise<{ audioUrl: string, timestamps: any[] }> {
    this.log('Generiere reales Voiceover (macOS TTS) & berechne Audio-Dauer...');
    
    // Combine full text
    const bodyText = scenes.map(s => s.voice).join(' ');
    const fullText = `${hookText} ${bodyText} ${ctaText}`.replace(/"/g, "'");
    
    const audioDir = path.join(process.cwd(), 'data', 'audio');
    if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });
    
    const aiffFile = path.join(audioDir, `temp_${this.sessionId}.aiff`);
    const mp3File = path.join(audioDir, `voice_${this.sessionId}.mp3`);
    
    try {
      // 1. Generate audio using mac 'say' (Anna is a German voice)
      await execAsync(`say -v "Anna" "${fullText}" -o "${aiffFile}"`);
      
      // 2. Convert to mp3
      await execAsync(`ffmpeg -i "${aiffFile}" -y "${mp3File}"`);
      
      // 3. Get exact duration in seconds
      const { stdout } = await execAsync(`ffprobe -i "${mp3File}" -show_entries format=duration -v quiet -of csv="p=0"`);
      const totalDurationSec = parseFloat(stdout.trim());
      
      // Cleanup aiff
      fs.unlinkSync(aiffFile);
      
      // 4. Distribute timestamps evenly over the words to sync perfectly
      const words = fullText.split(' ').filter(w => w.trim().length > 0);
      const timestamps = [];
      
      let currentTime = 0;
      // We weight the duration slightly by word length for a more natural sync
      const totalChars = words.reduce((acc, w) => acc + w.length, 0);
      
      for (const word of words) {
        const wordDuration = (word.length / totalChars) * totalDurationSec;
        timestamps.push({
          word: word,
          start: parseFloat(currentTime.toFixed(2)),
          end: parseFloat((currentTime + wordDuration).toFixed(2))
        });
        currentTime += wordDuration;
      }
      
      this.log('TTS Audio generiert & synchronisiert', 'success', { 
        durationSec: totalDurationSec.toFixed(2),
        wordCount: words.length
      });
      
      return {
        audioUrl: `/audio/voice_${this.sessionId}.mp3`,
        timestamps: timestamps
      };
      
    } catch (e: any) {
      this.log(`Fehler bei TTS Generierung: ${e.message}`, 'error');
      // Fallback
      return {
        audioUrl: '/audio/neo_mock_voice.mp3',
        timestamps: []
      };
    }
  }
}
