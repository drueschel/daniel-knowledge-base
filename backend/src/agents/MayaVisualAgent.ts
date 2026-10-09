import fs from 'fs';
import path from 'path';
import { BaseAgent } from './BaseAgent';
import { exec } from 'child_process';
import util from 'util';
const mp3Duration = require('mp3-duration');

const execAsync = util.promisify(exec);

export class MayaVisualAgent extends BaseAgent {
  private sessionId: string;
  constructor(sessionId: string) {
    super('visuals', sessionId);
    this.sessionId = sessionId;
  }

  public async generateVisualManifest(scriptData: any, audioUrl: string): Promise<{manifestPath: string, videoUrl: string}> {
    this.log('Maya beginnt mit der Erstellung des Visual Manifests', 'info');

    // 1. Extract Keywords for Pexels
    const pexelsKey = process.env.PEXELS_API_KEY;
    
    let videoUrls = [
      "https://videos.pexels.com/video-files/3252069/3252069-uhd_1440_2560_25fps.mp4",
      "https://videos.pexels.com/video-files/4122171/4122171-uhd_1440_2560_25fps.mp4",
      "https://videos.pexels.com/video-files/5195029/5195029-uhd_1440_2560_25fps.mp4"
    ];

    if (pexelsKey) {
      this.log('Suche passendes Footage auf Pexels...', 'info');
      try {
        const query = 'sad alone aesthetic vertical';
        const res = await fetch(`https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&orientation=portrait&size=medium&per_page=5`, {
          headers: { 'Authorization': pexelsKey }
        });
        const data = await res.json();
        if (data.videos && data.videos.length >= 3) {
           videoUrls = data.videos.slice(0, 3).map((v: any) => v.video_files.find((f:any)=>f.quality==='hd' || f.quality==='sd')?.link || v.video_files[0].link);
        }
      } catch (err) {
        this.log('Pexels API Fehler, nutze Fallbacks', 'warning');
      }
    }

    // Resolve real audio path
    // audioUrl comes in as "/outputs/audio_session_1791443949542.mp3"
    let relativeAudio = audioUrl;
    if (audioUrl.startsWith('http')) {
      const urlObj = new URL(audioUrl);
      relativeAudio = urlObj.pathname;
    }
    
    let audioPath = "";
    if (relativeAudio.startsWith('/audio/')) {
        audioPath = path.join(process.cwd(), 'data', 'audio', relativeAudio.replace('/audio/', ''));
    } else {
        audioPath = path.join(process.cwd(), 'public', relativeAudio);
    }
    
    // Get audio duration
    let durationSeconds = 10; // fallback
    try {
       durationSeconds = await mp3Duration(audioPath);
    } catch(e) {
       console.log("Could not get mp3 duration, using fallback 10s");
    }
    const totalFrames = Math.ceil(durationSeconds * 30); // 30 FPS

    const manifest = {
       audioUrl: audioUrl.startsWith('http') ? audioUrl : `http://localhost:4000${audioUrl}`, // Remotion needs absolute URL for audio if served over HTTP
       videos: videoUrls,
       text: scriptData[Object.keys(scriptData).find(k => k.startsWith('hook')) || 'hook_1'] || 'Neo Emotional Release',
       // NEW: Pass the abstract storyboard down to Remotion for future 2D Motion Graphics rendering
       storyboard: scriptData.storyboard || [],
       visualStyle: 'abstract_metaphors'
    };

    const manifestDir = path.join(process.cwd(), 'data', 'manifests');
    if (!fs.existsSync(manifestDir)) {
      fs.mkdirSync(manifestDir, { recursive: true });
    }
    
    const manifestPath = path.join(manifestDir, `${this.sessionId}.json`);
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    this.log('Visual Manifest erstellt, starte HyperFrames Engine (Remotion)...', 'info');
    
    // Render the video!
    const outputFileName = `video_${this.sessionId}.mp4`;
    const outputPath = path.join(process.cwd(), 'public', 'outputs', outputFileName);
    
    const remotionDir = path.join(process.cwd(), 'remotion');
    
    try {
      // Pass frames dynamically via calculateMetadata in the remotion project itself
      const cmd = `npx remotion render src/index.ts HyperFrames "${outputPath}" --props="${manifestPath}" --log=info`;
      await execAsync(cmd, { cwd: remotionDir });
      this.log('HyperFrames Rendering erfolgreich abgeschlossen!', 'success');
    } catch (e: any) {
      this.log(`Fehler beim Rendern: ${e.message}`, 'error');
      throw new Error(`Remotion Error: ${e.message}`);
    }

    return {
      manifestPath,
      videoUrl: `http://localhost:4000/outputs/${outputFileName}`
    };
  }
}
