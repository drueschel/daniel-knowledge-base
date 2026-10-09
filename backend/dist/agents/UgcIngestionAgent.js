"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.UgcIngestionAgent = void 0;
const BaseAgent_1 = require("./BaseAgent");
const child_process_1 = require("child_process");
const util_1 = require("util");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class UgcIngestionAgent extends BaseAgent_1.BaseAgent {
    constructor(sessionId) {
        super('production', sessionId); // Using production profile
        this.profile.name = 'Echo (UGC Ingestion)';
    }
    async processUgcVideo(videoPath) {
        this.log('Extrahiere Audio aus UGC Video...');
        const audioDir = path.join(process.cwd(), 'data', 'audio');
        if (!fs.existsSync(audioDir))
            fs.mkdirSync(audioDir, { recursive: true });
        const audioPath = path.join(audioDir, `voice_${this.currentSessionId}.mp3`); // Named exactly like Hephaistos to work with frontend
        try {
            // 1. Extract audio
            await execAsync(`ffmpeg -y -i "${videoPath}" -q:a 0 -map a "${audioPath}"`);
            this.log('Transkribiere Audio via Groq Whisper...');
            let fullText = "Dies ist ein Test für das benutzergenerierte Video. Wir ersetzen das Skript mit der echten Transkription.";
            let wordsData = [];
            try {
                const groqApiKey = process.env.GROQ_API_KEY;
                if (groqApiKey) {
                    const formData = new FormData();
                    const audioBuffer = fs.readFileSync(audioPath);
                    const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
                    formData.append('file', blob, 'audio.mp3');
                    formData.append('model', 'whisper-large-v3');
                    formData.append('response_format', 'verbose_json');
                    formData.append('timestamp_granularities[]', 'word');
                    formData.append('language', 'de');
                    const groqRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${groqApiKey}`
                        },
                        body: formData
                    });
                    if (groqRes.ok) {
                        const data = await groqRes.json();
                        if (data.text && data.text.trim().length > 0) {
                            fullText = data.text.trim().replace(/"/g, "'");
                            wordsData = data.words || [];
                            this.log('Transkription erfolgreich (mit exakten Timestamps): ' + fullText.substring(0, 50) + '...');
                        }
                    }
                    else {
                        const errText = await groqRes.text();
                        throw new Error(`Groq API Error: ${groqRes.status} ${errText}`);
                    }
                }
                else {
                    this.log('Kein Groq Key gefunden, nutze Dummy-Text.');
                }
            }
            catch (transcribeErr) {
                this.log(`Groq Transkription fehlgeschlagen, nutze Fallback. (${transcribeErr.message})`, 'warning');
            }
            this.log('Messe Audio-Dauer für Timestamps...');
            const { stdout } = await execAsync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${audioPath}"`);
            const totalDurationSec = parseFloat(stdout.trim());
            let timestamps = [];
            let cropStart = 0;
            let cropEnd = totalDurationSec;
            if (wordsData && wordsData.length > 0) {
                timestamps = wordsData.map((w) => ({
                    word: w.word,
                    start: w.start,
                    end: w.end
                }));
                const firstStart = timestamps[0].start;
                const lastEnd = timestamps[timestamps.length - 1].end;
                if (firstStart > 1.0)
                    cropStart = Math.max(0, firstStart - 0.5);
                if (totalDurationSec - lastEnd > 1.0)
                    cropEnd = Math.min(totalDurationSec, lastEnd + 0.5);
                if (cropStart > 0 || cropEnd < totalDurationSec) {
                    this.log(`Trimme Video (Schneide Stille): Start=${cropStart}s, Ende=${cropEnd}s`);
                    const tmpAudio = audioPath + '.trim.mp3';
                    const tmpVideo = videoPath + '.trim.mp4';
                    await execAsync(`ffmpeg -y -i "${audioPath}" -ss ${cropStart} -to ${cropEnd} -c copy "${tmpAudio}"`);
                    // Re-encode video slightly to ensure keyframes align perfectly when trimming
                    await execAsync(`ffmpeg -y -i "${videoPath}" -ss ${cropStart} -to ${cropEnd} -c:v libx264 -preset ultrafast -c:a aac "${tmpVideo}"`);
                    fs.renameSync(tmpAudio, audioPath);
                    fs.renameSync(tmpVideo, videoPath);
                    // Adjust timestamps to new 0-based time
                    timestamps = timestamps.map(t => ({
                        word: t.word,
                        start: Math.max(0, t.start - cropStart),
                        end: Math.max(0, t.end - cropStart)
                    }));
                }
            }
            else {
                // Fallback uniform distribution
                const words = fullText.split(' ').filter(w => w.trim().length > 0);
                let currentTime = 0;
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
            }
            this.log('UGC Video erfolgreich verarbeitet & synchronisiert.', 'success');
            return { transcript: fullText, timestamps };
        }
        catch (e) {
            this.log(`Fehler bei UGC Verarbeitung: ${e.message}`, 'error');
            return { transcript: "Fehler beim Verarbeiten", timestamps: [] };
        }
    }
}
exports.UgcIngestionAgent = UgcIngestionAgent;
