import { BaseAgent } from './BaseAgent';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class MayaVisualAgent extends BaseAgent {
  constructor(sessionId: string) {
    super('visuals', sessionId);
  }

  async generateStoryboard(scenes: any[]): Promise<any[]> {
    this.log('Generiere Higgsfield 3D-Metaphern (Storyboard)...');
    
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const storyboard = [];
    
    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      // Simulate generating a prompt using the brand identity
      const prompt = scene.prompt || `Premium 3D icon object of [${scene.visual || scene.visual_instruction}], frosted translucent glass, violet #6C2BF2 / lilac #C0A5FB inner glow, cyan #4DE8FF rim light, three-quarter perspective, octane render, isolated on plain pure black background, no text, no logo`;
      
      storyboard.push({
        id: i,
        voice: scene.voice,
        visual_instruction: scene.visual || scene.visual_instruction,
        prompt: prompt,
        imageUrl: scene.imageUrl || `https://picsum.photos/seed/${this.currentSessionId}_${i}/800/800` // Mock 3D image
      });
    }
    
    this.log('Storyboard & 3D-Assets erfolgreich generiert.', 'success', { 
      scenesCount: storyboard.length 
    });
    
    return storyboard;
  }

  async renderVideo(manifestData: any): Promise<{ videoUrl: string }> {
    this.log('Übergebe an Remotion (HyperFrames) für finales Video-Rendering...');
    
    const { storyboard, timestamps, audioUrl } = manifestData;
    
    // Create the Remotion storyboard format
    const remotionScenes = [];
    const fps = 30;
    
    // We'll create a scene for each storyboard entry
    // But since it's just kinetic typography, we map the text
    const colors = [
      ["#4f46e5", "#7c3aed"], // Indigo to Purple
      ["#ec4899", "#ef4444"], // Pink to Red
      ["#059669", "#10b981"], // Emerald
      ["#f59e0b", "#d97706"]  // Amber
    ];

    const sceneBoundaries: any[] = [];
    let currentTsIndex = 0;
    
    for (let i = 0; i < storyboard.length; i++) {
       const rawWords = storyboard[i].voice.split(' ').filter((w: any) => w.length > 0);
       let startBoundary: number = i === 0 ? 0 : sceneBoundaries[i-1].end;
       let endBoundary: number = startBoundary + 3.0; 
       let mappedWords: any[] = [];
       
       if (timestamps && timestamps.length > currentTsIndex) {
         const sceneTimestamps = timestamps.slice(currentTsIndex, currentTsIndex + rawWords.length);
         if (sceneTimestamps.length > 0) {
            const lastWord = sceneTimestamps[sceneTimestamps.length - 1];
            if (currentTsIndex + rawWords.length < timestamps.length) {
               const nextWord = timestamps[currentTsIndex + rawWords.length];
               endBoundary = (lastWord.end + nextWord.start) / 2;
            } else {
               endBoundary = lastWord.end + 1.0;
            }
            mappedWords = sceneTimestamps.map((ts: any) => ({
               word: ts.word,
               startFrame: Math.max(0, Math.round((ts.start - startBoundary) * fps))
            }));
         }
         currentTsIndex += rawWords.length;
       } else {
         startBoundary = i === 0 ? 0 : (sceneBoundaries[i-1] ? sceneBoundaries[i-1].end : 0);
         endBoundary = startBoundary + Math.max(3, rawWords.length * 0.5);
         mappedWords = rawWords.map((w: any, idx: number) => ({ word: w, startFrame: idx * 8 + 10 }));
       }
       
       sceneBoundaries.push({ start: startBoundary, end: endBoundary, words: mappedWords });
    }

    for (let i = 0; i < storyboard.length; i++) {
      const scene = storyboard[i];
      const boundary = sceneBoundaries[i];
      const durationSec = boundary.end - boundary.start;
      const durationInFrames = Math.max(30, Math.round(durationSec * fps));
      
      remotionScenes.push({
        durationInFrames,
        headline: scene.visual_instruction || `Szene ${i+1}`,
        words: boundary.words,
        imageUrl: scene.imageUrl || `https://picsum.photos/seed/${this.currentSessionId}_${i}_${Date.now()}/800/800`
      });
    }

    const fullAudioUrl = audioUrl ? `http://localhost:4000${audioUrl}` : null;

    const remotionData = {
      audioUrl: fullAudioUrl,
      scenes: remotionScenes
    };

    // 1. Write the json to video-engine/src/storyboard.json
    const videoEngineDir = path.resolve(process.cwd(), '../video-engine');
    const storyboardPath = path.join(videoEngineDir, 'src', 'storyboard.json');
    fs.writeFileSync(storyboardPath, JSON.stringify(remotionData, null, 2));
    
    this.log('Schreibe Remotion Storyboard.json und starte Build-Prozess (kann 1-2 Minuten dauern)...');
    
    try {
      // 2. Run Remotion build
      await execAsync('npm install', { cwd: videoEngineDir });
      await execAsync('npx remotion render MyComp out/video.mp4', { cwd: videoEngineDir });
      
      // 3. Move output to backend public folder
      const outputFilename = `rendered_${this.currentSessionId}.mp4`;
      const sourceVideo = path.join(videoEngineDir, 'out', 'video.mp4');
      const targetVideo = path.resolve(process.cwd(), 'public', 'outputs', outputFilename);
      
      // Ensure outputs dir exists
      if (!fs.existsSync(path.dirname(targetVideo))) {
        fs.mkdirSync(path.dirname(targetVideo), { recursive: true });
      }
      
      fs.copyFileSync(sourceVideo, targetVideo);
      
      this.log('Remotion Rendering erfolgreich!', 'success', { outputFilename });
      return { videoUrl: `/outputs/${outputFilename}` };
      
    } catch (err: any) {
      this.log(`Fehler beim Remotion Rendering: ${err.message}`, 'error');
      throw err;
    }
  }
}
