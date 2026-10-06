import { useState } from 'react';
import { Bot, FileText, Image as ImageIcon, Mic, Settings, Play, CheckCircle2, ChevronRight, Wand2, Users, Star, TrendingUp, BrainCircuit, Video, Database, Activity, Share2 } from 'lucide-react';

const employees = [
  { 
    id: 'ingest', name: 'Felix', role: 'Head of Ingestion (Data)', level: 1, avatar: '👨🏽‍💻', traits: ['Schnell', 'Strukturiert'], performance: 0, stats: '0 Videos importiert',
    description: 'Felix saugt externe Quellen (wie YouTube) auf und formatiert die pure Essenz sauber in deine Obsidian-Vault.',
    color: 'bg-red-500/20 text-red-400 border-red-500/30'
  },
  { 
    id: 'mia', name: 'Mia', role: 'Head of Trend Strategy', level: 1, avatar: '📱', traits: ['IG-Expertin', 'Trendscout'], performance: 0, stats: '0 Formate definiert',
    description: 'Mia legt das virale Format fest (POV, B-Roll, Audio) basierend auf Olivers Analytics-Daten, BEVOR inhaltlich gearbeitet wird.',
    color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
  },
  { 
    id: 'research', name: 'Dr. Elena', role: 'Head of Knowledge (RAG)', level: 1, avatar: '👩🏻‍🏫', traits: ['Analytisch', 'Detailverliebt'], performance: 0, stats: '0 Dokumente analysiert',
    description: 'Elena liest deine Obsidian-Vault und liefert die harten psychologischen Fakten passend zu Mias Formatvorgaben.',
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  },
  { 
    id: 'script', name: 'Leo', role: 'Creative Director (Script)', level: 1, avatar: '🧑🏽‍🎨', traits: ['Hook-Meister', 'A/B-Tester'], performance: 0, stats: '0 Skripte geschrieben',
    description: 'Leo schreibt konvertierende Skripte und liefert immer zwingend 3 Hook-Varianten für A/B-Testing.',
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
  },
  { 
    id: 'voice', name: 'Arthur', role: 'Voice Actor (TTS)', level: 1, avatar: '🎙️', traits: ['Empathisch', 'Warm'], performance: 0, stats: '0 Minuten generiert',
    description: 'Arthur vertont das Skript mit ElevenLabs für maximale Emotion und perfekte Pausensetzung.',
    color: 'bg-green-500/20 text-green-400 border-green-500/30'
  },
  { 
    id: 'visuals', name: 'Maya', role: 'Art Director (Visuals)', level: 1, avatar: '👩🏼‍🎤', traits: ['Kinetisch', 'Ästhetisch'], performance: 0, stats: '0 Bilder generiert',
    description: 'Maya generiert nicht nur Bilder, sondern steuert B-Roll und kinetische Text-Animationen für HyperFrames.',
    color: 'bg-pink-500/20 text-pink-400 border-pink-500/30'
  },
  { 
    id: 'qa', name: 'Sarah', role: 'Chief Editor (Vision QA)', level: 1, avatar: '🧐', traits: ['Kritisch', 'Multimodal'], performance: 0, stats: '0 Reels geprüft',
    description: 'Sarah prüft das Skript UND das finale Video (Pacing, visuelle Hook-Länge). Nichts geht ohne ihre Freigabe raus.',
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
  },
  { 
    id: 'dist', name: 'Tom', role: 'Distribution & Community', level: 1, avatar: '✉️', traits: ['Copywriter', 'ManyChat-Pro'], performance: 0, stats: '0 Captions erstellt',
    description: 'Tom schnürt das Paket für deinen Upload: Er schreibt die SEO-Caption, Hashtags und den perfekten ManyChat-Prompt für die Kommentare.',
    color: 'bg-teal-500/20 text-teal-400 border-teal-500/30'
  },
  { 
    id: 'analytics', name: 'Oliver', role: 'Head of Growth (Analytics)', level: 1, avatar: '📈', traits: ['Datengetrieben', 'Feedback-Loop'], performance: 0, stats: '0 Insights analysiert',
    description: 'Der Motor: Oliver zieht IG-Insights (Retention-Graphs) deines Uploads und schickt das Feedback zurück an Mia und Leo.',
    color: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'team' | 'studio' | 'import'>('import');
  const [activeStep, setActiveStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [topic, setTopic] = useState('Verschmelzungstyp - Lektion 14');
  
  const [ytUrl, setYtUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importStep, setImportStep] = useState(0);
  const [importResponse, setImportResponse] = useState<any>(null);

  const startPipeline = () => {
    setIsRunning(true);
    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      setActiveStep(step);
      if (step >= 9) { // 8 Agents + Render = 9 steps
        clearInterval(interval);
        setIsRunning(false);
      }
    }, 2800);
  };

  const startImport = async () => {
    if(!ytUrl) return;
    setIsImporting(true);
    setImportStep(1);
    setImportResponse(null);

    try {
      // Update step visual instantly to indicate backend processing
      const timer = setInterval(() => {
         setImportStep(s => s < 2 ? s + 1 : s);
      }, 1500);

      const response = await fetch("http://localhost:4000/api/ingest/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: ytUrl })
      });
      
      clearInterval(timer);
      
      if (response.ok) {
        const data = await response.json();
        setImportResponse(data);
        setImportStep(3);
      } else {
        alert("Fehler beim Importieren!");
        setImportStep(0);
      }
    } catch (e) {
      alert("Backend nicht erreichbar! Läuft der Node-Server auf Port 4000?");
      setImportStep(0);
    } finally {
      setTimeout(() => setIsImporting(false), 2000);
    }
  };

  // Filter studio agents (exclude Ingest & Analytics for the active render pipeline, include render step)
  const studioPipeline = [
    employees.find(e => e.id === 'mia'),
    employees.find(e => e.id === 'research'),
    employees.find(e => e.id === 'script'),
    employees.find(e => e.id === 'voice'),
    employees.find(e => e.id === 'visuals'),
    { id: 'render', name: 'HyperFrames', avatar: '🎬', role: 'System' },
    employees.find(e => e.id === 'qa'),
    employees.find(e => e.id === 'dist')
  ];

  return (
    <div className="flex h-screen bg-slate-900 text-slate-200 overflow-hidden font-sans">
      {/* Sidebar */}
      <div className="w-72 bg-slate-950 border-r border-slate-800 flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Wand2 className="w-8 h-8 text-indigo-400" />
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              Creator CEO
            </h1>
          </div>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-bold ml-11">Dashboard</p>
        </div>
        
        <div className="px-4 space-y-2 mt-4">
          <button onClick={() => setActiveTab('team')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'team' ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}>
            <Users className="w-5 h-5" />
            <span className="font-medium">Mitarbeiter Portal ({employees.length})</span>
          </button>
          <button onClick={() => setActiveTab('import')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'import' ? 'bg-red-500/10 text-red-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}>
            <Video className="w-5 h-5" />
            <span className="font-medium">Wissens-Import (Felix)</span>
          </button>
          <button onClick={() => setActiveTab('studio')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'studio' ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}>
            <Play className="w-5 h-5" />
            <span className="font-medium">Reel-Studio E2E</span>
          </button>
        </div>
        
        <div className="mt-auto p-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl mb-4">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Activity className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-bold uppercase">Feedback Loop</span>
            </div>
            <p className="text-xs text-slate-500">Oliver wartet auf neue IG Insights des letzten Uploads zur Optimierung der Hooks.</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'team' && (
          <div className="p-10 max-w-7xl mx-auto">
            <header className="mb-10">
              <h2 className="text-3xl font-bold mb-2 text-white">Dein E2E Agenten-Team</h2>
              <p className="text-slate-400 text-lg">9 Core-Rollen für den wasserdichten Content-Zyklus.</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {employees.map(emp => (
                <div key={emp.id} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 hover:bg-slate-800 transition shadow-xl flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border ${emp.color}`}>{emp.avatar}</div>
                      <div>
                        <h3 className="text-lg font-bold text-white leading-tight">{emp.name}</h3>
                        <p className="text-xs text-slate-400">{emp.role}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-300 text-xs mb-4 leading-relaxed flex-1">{emp.description}</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {emp.traits.map(t => <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">{t}</span>)}
                  </div>
                  <div className="pt-3 border-t border-slate-700/50 flex justify-between items-center mt-auto">
                    <span className="text-xs font-bold text-white">Lvl {emp.level}</span>
                    <button className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 text-xs font-medium transition">
                      <BrainCircuit className="w-3.5 h-3.5" /> Trainieren
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* YOUTUBE IMPORT */}
        {activeTab === 'import' && (
          <div className="p-10 max-w-4xl mx-auto">
             <header className="mb-10">
              <h2 className="text-3xl font-bold mb-2 text-white">YouTube &rarr; Obsidian</h2>
            </header>
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 shadow-2xl">
              <div className="flex gap-4 items-end mb-10">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-slate-300 mb-3 uppercase tracking-wide">YouTube Video URL</label>
                  <input type="text" placeholder="https://youtube.com/watch?v=..." value={ytUrl} onChange={(e) => setYtUrl(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 text-white font-medium focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition shadow-inner" />
                </div>
                <button onClick={startImport} disabled={isImporting || !ytUrl} className="bg-red-600 hover:bg-red-500 text-white font-bold py-4 px-8 rounded-xl flex items-center gap-2 disabled:opacity-50 transition transform hover:scale-105 active:scale-95 shadow-xl">
                  <Database className="w-5 h-5" /> Import
                </button>
              </div>

              {/* Status UI */}
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-700/50 min-h-[200px]">
                {importStep === 0 && !importResponse && (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500">
                    <Bot className="w-12 h-12 mb-3 opacity-20" />
                    <p>Felix wartet auf einen Auftrag...</p>
                  </div>
                )}
                
                {importStep > 0 && (
                  <div className="space-y-4">
                    <div className={`flex items-center gap-3 transition-opacity ${importStep >= 1 ? 'opacity-100 text-blue-400' : 'opacity-30'}`}>
                      {importStep > 1 ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
                      <span>Sende URL an lokales Backend...</span>
                    </div>
                    <div className={`flex items-center gap-3 transition-opacity ${importStep >= 2 ? 'opacity-100 text-purple-400' : 'opacity-30'}`}>
                      {importStep > 2 ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : (importStep === 2 ? <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div> : <div className="w-5 h-5 rounded-full border-2 border-slate-700"></div>)}
                      <span>Agent Felix zieht Transkript und extrahiert Fakten...</span>
                    </div>
                    <div className={`flex items-center gap-3 transition-opacity ${importStep >= 3 ? 'opacity-100 text-emerald-400' : 'opacity-30'}`}>
                       {importStep >= 3 ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-700"></div>}
                      <span>Als Markdown in Obsidian gespeichert!</span>
                    </div>
                  </div>
                )}

                {importResponse && (
                  <div className="mt-8 p-4 bg-emerald-900/20 border border-emerald-500/30 rounded-lg">
                    <p className="text-emerald-400 font-bold mb-2">{importResponse.message}</p>
                    <p className="text-slate-300 text-sm">Gespeichert unter: <code className="bg-black/50 px-2 py-1 rounded">{importResponse.path}</code></p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* PRODUCTION STUDIO */}
        {activeTab === 'studio' && (
          <div className="p-10 max-w-7xl mx-auto">
            <header className="mb-10">
              <h2 className="text-3xl font-bold mb-2 text-white">Reel-Studio (E2E Pipeline)</h2>
              <p className="text-slate-400 text-lg">Der wasserdichte Produktionszyklus inkl. A/B-Hooks, Video-QA und Upload-Paket.</p>
            </header>

            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 shadow-2xl">
              <div className="mb-10">
                <label className="block text-sm font-bold text-slate-300 mb-3 uppercase tracking-wide">Auftrag: Thema & Wissenbasis</label>
                <select value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full max-w-xl bg-slate-900 border border-slate-600 rounded-xl p-4 text-white font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition shadow-inner">
                  <option>Verschmelzungstyp - Lektion 14</option>
                  <option>Autonomietyp - Lektion 14</option>
                </select>
              </div>

              <div className="bg-slate-900 rounded-xl p-6 mb-10 border border-slate-700/50 shadow-inner">
                {/* Pipeline visual */}
                <div className="flex justify-between items-center mb-8 relative px-2">
                  <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-slate-800 rounded-full"></div>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-emerald-500 rounded-full transition-all duration-700 ease-in-out" style={{ width: `${(activeStep / (studioPipeline.length - 1)) * 100}%` }}></div>
                  
                  {studioPipeline.map((step, idx) => (
                    <div key={idx} className="relative z-10 flex flex-col items-center gap-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 shadow-lg transition-all duration-300 ${
                        idx < activeStep ? 'bg-slate-800 border-indigo-500' : 
                        idx === activeStep && isRunning ? 'bg-slate-800 border-purple-400 animate-pulse scale-125' : 
                        'bg-slate-900 border-slate-800 opacity-50 grayscale'
                      }`}>
                        {idx < activeStep ? <CheckCircle2 className="w-5 h-5 text-indigo-400" /> : step?.avatar}
                      </div>
                      <span className={`text-[9px] font-bold uppercase tracking-wider ${idx <= activeStep ? 'text-white' : 'text-slate-500'}`}>{step?.name}</span>
                    </div>
                  ))}
                </div>

                {/* Status Console */}
                <div className="bg-black/40 rounded-lg p-5 min-h-[160px] border border-slate-800 font-mono text-sm leading-relaxed">
                  {activeStep === 0 && !isRunning && <p className="text-slate-500">Warten auf Projektauftrag durch CEO...</p>}
                  {activeStep === 0 && isRunning && <p className="text-cyan-400">» Mia: Analysiere Oliver's letzte Daten. POV Format konvertiert 30% besser. Wähle POV-Format mit Lo-Fi Audio.</p>}
                  {activeStep === 1 && <p className="text-blue-400">» Elena: Extrahiere Fakten zu "{topic}" aus Obsidian...</p>}
                  {activeStep === 2 && <p className="text-purple-400">» Leo: Schreibe Skript inkl. zwingend 3 separater Hooks für A/B-Testing...</p>}
                  {activeStep === 3 && <p className="text-green-400">» Arthur: Generiere emotionales Voiceover (ElevenLabs) für alle 3 Hooks + Body...</p>}
                  {activeStep === 4 && <p className="text-pink-400">» Maya: Erstelle B-Roll Bilder und kinetische Typografie-Assets...</p>}
                  {activeStep === 5 && <p className="text-orange-400">» System: HyperFrames generiert 3 fertige Video-Versionen (A/B/C Hook)...</p>}
                  {activeStep === 6 && <p className="text-amber-400">» Sarah: Multimodal QA! Prüfe Videomaterial. Pacing in Video A ist perfekt. Video B wird verworfen (Text zu schnell).</p>}
                  {activeStep === 7 && <p className="text-teal-400">» Tom: Generiere SEO-Caption, Hashtags und ManyChat-Setup ("Kommentiere TYP").</p>}
                  
                  {activeStep >= 8 && (
                    <div className="text-emerald-400 mt-2 bg-emerald-900/20 p-4 rounded-lg border border-emerald-500/30">
                      <p className="font-bold flex items-center gap-2 text-base mb-2">
                        <CheckCircle2 className="w-6 h-6" /> Reel-Paket 100% fertig für deinen Upload!
                      </p>
                      <ul className="text-slate-300 text-xs space-y-1 list-disc ml-6">
                        <li>3 Video-Versionen (mp4) exportiert (Für Testing)</li>
                        <li>Caption & Hashtags in Zwischenablage bereit</li>
                        <li>ManyChat Call-to-Action verifiziert</li>
                      </ul>
                      <p className="text-orange-400 text-xs mt-3">⏳ Oliver wartet auf Insights 24h nach deinem Upload.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button onClick={startPipeline} disabled={isRunning || activeStep > 7} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-8 rounded-xl flex items-center gap-3 transition shadow-xl">
                  {isRunning ? 'Pipeline läuft...' : 'E2E Produktion starten'} 
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
