import { useState } from 'react';
import { Bot, FileText, Image as ImageIcon, Mic, Settings, Play, CheckCircle2, ChevronRight, Wand2, Users, Star, TrendingUp, BrainCircuit, Youtube, Database, Eye, CheckSquare } from 'lucide-react';

const employees = [
  { 
    id: 'ingest', 
    name: 'Felix', 
    role: 'Head of Ingestion (Data)', 
    level: 1,
    avatar: '👨🏽‍💻',
    traits: ['Schnell', 'Strukturiert', 'Wissensdurstig'],
    performance: 0,
    stats: '0 Videos importiert',
    description: 'Felix saugt externe Quellen (wie YouTube) auf. Er zieht blitzschnell das Transkript und formatiert die pure Essenz sauber in deine Obsidian-Vault.',
    color: 'bg-red-500/20 text-red-400 border-red-500/30'
  },
  { 
    id: 'mia', 
    name: 'Mia', 
    role: 'Head of Trend Strategy', 
    level: 1,
    avatar: '📱',
    traits: ['IG-Expertin', 'Algorithm-Hacker', 'Trendscout'],
    performance: 0,
    stats: '0 Formate definiert',
    description: 'Mia kennt jeden Instagram-Trend (Inspiriert von Mia Pejic). Sie legt das virale Format (POV, B-Roll, Audio-Style) fest, BEVOR überhaupt inhaltlich gearbeitet wird.',
    color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
  },
  { 
    id: 'research', 
    name: 'Dr. Elena', 
    role: 'Head of Knowledge (RAG)', 
    level: 1,
    avatar: '👩🏻‍🏫',
    traits: ['Analytisch', 'Detailverliebt'],
    performance: 0,
    stats: '0 Dokumente analysiert',
    description: 'Elena liest deine Obsidian-Vault wie ein Buch. Sie liefert die harten psychologischen Fakten passend zu Mias Formatvorgaben.',
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  },
  { 
    id: 'script', 
    name: 'Leo', 
    role: 'Creative Director (Script)', 
    level: 1,
    avatar: '🧑🏽‍🎨',
    traits: ['Gen Z Experte', 'Hook-Meister'],
    performance: 0,
    stats: '0 Hooks geschrieben',
    description: 'Leo übersetzt Elenas Fakten in Mias Trend-Formate. Er schreibt hochgradig konvertierende Skripte für maximale Watch-Time.',
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
  },
  { 
    id: 'qa', 
    name: 'Sarah', 
    role: 'Chief Editor (QA & Compliance)', 
    level: 1,
    avatar: '🧐',
    traits: ['Kritisch', 'Perfektionistisch', 'Streng'],
    performance: 0,
    stats: '0 Skripte geprüft',
    description: 'Sarah ist der Gatekeeper. Sie prüft Leos Skripte auf "Curiosity Gaps" und Hook-Längen (max 3 Sek). Was nicht konvertiert, geht zurück an Leo.',
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
  },
  { 
    id: 'voice', 
    name: 'Arthur', 
    role: 'Voice Actor (TTS)', 
    level: 1,
    avatar: '🎙️',
    traits: ['Empathisch', 'Warm'],
    performance: 0,
    stats: '0 Minuten generiert',
    description: 'Arthur hat die Stimme eines Radiomoderators und nutzt ElevenLabs für maximale Emotion.',
    color: 'bg-green-500/20 text-green-400 border-green-500/30'
  },
  { 
    id: 'visuals', 
    name: 'Maya', 
    role: 'Art Director (Visuals)', 
    level: 1,
    avatar: '👩🏼‍🎤',
    traits: ['Ästhetisch', 'Comic-Fan'],
    performance: 0,
    stats: '0 Bilder generiert',
    description: 'Maya generiert die Bilder für HyperFrames basierend auf Leos Prompts (Fal.ai Flux).',
    color: 'bg-pink-500/20 text-pink-400 border-pink-500/30'
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'team' | 'studio' | 'import'>('team');
  const [activeStep, setActiveStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [topic, setTopic] = useState('Verschmelzungstyp - Lektion 14');
  
  const [ytUrl, setYtUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importStep, setImportStep] = useState(0);

  const startPipeline = () => {
    setIsRunning(true);
    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      setActiveStep(step);
      if (step >= 7) {
        clearInterval(interval);
        setIsRunning(false);
      }
    }, 2500);
  };

  const startImport = () => {
    if(!ytUrl) return;
    setIsImporting(true);
    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      setImportStep(step);
      if (step >= 3) {
        clearInterval(interval);
        setTimeout(() => setIsImporting(false), 2000);
      }
    }, 2000);
  }

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
            <span className="font-medium">Mitarbeiter Portal</span>
          </button>
          <button onClick={() => setActiveTab('import')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'import' ? 'bg-red-500/10 text-red-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}>
            <Youtube className="w-5 h-5" />
            <span className="font-medium">Wissens-Import</span>
          </button>
          <button onClick={() => setActiveTab('studio')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'studio' ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}>
            <Play className="w-5 h-5" />
            <span className="font-medium">Reel-Studio</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'team' && (
          <div className="p-10 max-w-6xl mx-auto">
            <header className="mb-10">
              <h2 className="text-3xl font-bold mb-2 text-white">Dein Agenten-Team</h2>
              <p className="text-slate-400 text-lg">Verwalte deine 7 hochspezialisierten Mitarbeiter.</p>
            </header>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {employees.map(emp => (
                <div key={emp.id} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:bg-slate-800 transition shadow-xl flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl border ${emp.color}`}>{emp.avatar}</div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{emp.name}</h3>
                        <p className="text-sm text-slate-400">{emp.role}</p>
                      </div>
                    </div>
                    <div className="bg-slate-900 border border-slate-700 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-inner">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-bold text-white">{emp.performance}%</span>
                    </div>
                  </div>
                  <p className="text-slate-300 text-sm mb-6 leading-relaxed flex-1">{emp.description}</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {emp.traits.map(t => <span key={t} className="text-xs px-2.5 py-1 rounded-md bg-slate-900 text-slate-300 border border-slate-700">{t}</span>)}
                  </div>
                  <div className="pt-4 border-t border-slate-700/50 flex justify-between items-center mt-auto">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-500 font-medium">Erfahrung</span>
                        <span className="text-sm font-bold text-white">Lvl {emp.level}</span>
                      </div>
                      <div className="w-px h-8 bg-slate-700"></div>
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-500 font-medium">Output</span>
                        <span className="text-sm font-bold text-white">{emp.stats}</span>
                      </div>
                    </div>
                    <button className="flex items-center gap-2 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 px-4 py-2 rounded-lg text-sm font-medium transition">
                      <BrainCircuit className="w-4 h-4" /> Trainieren
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
            {/* Same as before */}
             <header className="mb-10">
              <h2 className="text-3xl font-bold mb-2 text-white">YouTube &rarr; Obsidian</h2>
              <p className="text-slate-400 text-lg">Lass Felix neue Videos scannen und perfekt strukturiert in deine Wissensdatenbank (Obsidian) einpflegen.</p>
            </header>
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 shadow-2xl">
              <div className="flex gap-4 items-end mb-10">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-slate-300 mb-3 uppercase tracking-wide">YouTube Video URL</label>
                  <input type="text" placeholder="https://youtube.com/watch?v=..." value={ytUrl} onChange={(e) => setYtUrl(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 text-white font-medium focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition shadow-inner" />
                </div>
                <button onClick={startImport} disabled={isImporting || !ytUrl} className="bg-red-600 hover:bg-red-500 text-white font-bold py-4 px-8 rounded-xl flex items-center gap-2 disabled:opacity-50 transition transform hover:scale-105 active:scale-95 shadow-xl">
                  <Database className="w-5 h-5" /> {isImporting ? 'Felix arbeitet...' : 'Import starten'}
                </button>
              </div>
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-700/50 shadow-inner font-mono text-sm leading-relaxed min-h-[160px]">
                {importStep === 0 && !isImporting && <p className="text-slate-500">Felix wartet auf einen neuen YouTube-Link...</p>}
                {importStep >= 1 && <p className="text-blue-400 mb-2">» Felix: YouTube-Transkript wird via yt-dlp heruntergeladen...</p>}
                {importStep >= 2 && <p className="text-purple-400 mb-2">» Felix: Übergebe Transkript an LLM zur Strukturierung...</p>}
                {importStep >= 3 && (
                  <div className="text-emerald-400"><p className="mb-2">» Felix: Markdown-Datei erfolgreich erstellt!</p></div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PRODUCTION STUDIO */}
        {activeTab === 'studio' && (
          <div className="p-10 max-w-6xl mx-auto">
            <header className="mb-10">
              <h2 className="text-3xl font-bold mb-2 text-white">Reel-Studio</h2>
              <p className="text-slate-400 text-lg">Der vollautomatische 6-Agenten Workflow (Mia ➔ Elena ➔ Leo ➔ Sarah ➔ Arthur ➔ Maya).</p>
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
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 rounded-full transition-all duration-700 ease-in-out" style={{ width: `${(activeStep / 6) * 100}%` }}></div>
                  
                  {employees.slice(1).map((step, idx) => (
                    <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl border-4 shadow-lg transition-all duration-300 ${
                        idx < activeStep ? 'bg-slate-800 border-indigo-500' : 
                        idx === activeStep && isRunning ? 'bg-slate-800 border-purple-400 animate-pulse scale-110' : 
                        'bg-slate-900 border-slate-800 opacity-50 grayscale'
                      }`}>
                        {idx < activeStep ? <CheckCircle2 className="w-6 h-6 text-indigo-400" /> : step.avatar}
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${idx <= activeStep ? 'text-white' : 'text-slate-500'}`}>{step.name}</span>
                    </div>
                  ))}
                  <div className="relative z-10 flex flex-col items-center gap-2">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl border-4 shadow-lg transition-all duration-300 ${
                      6 < activeStep ? 'bg-slate-800 border-indigo-500' : 
                      6 === activeStep && isRunning ? 'bg-slate-800 border-orange-400 animate-pulse scale-110' : 
                      'bg-slate-900 border-slate-800 opacity-50 grayscale'
                    }`}>
                      {6 < activeStep ? <CheckCircle2 className="w-6 h-6 text-indigo-400" /> : '🎬'}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${6 <= activeStep ? 'text-white' : 'text-slate-500'}`}>HyperFrames</span>
                  </div>
                </div>

                {/* Status Console */}
                <div className="bg-black/40 rounded-lg p-5 min-h-[160px] border border-slate-800 font-mono text-sm leading-relaxed">
                  {activeStep === 0 && !isRunning && <p className="text-slate-500">Warten auf Projektauftrag durch CEO...</p>}
                  {activeStep === 0 && isRunning && <p className="text-cyan-400">» Mia (Trends): Scanne IG für Format. Entscheidung: POV-B-Roll, Lo-Fi Audio.</p>}
                  {activeStep === 1 && <p className="text-blue-400">» Elena (RAG): Extrahiere Fakten zu "{topic}" aus Obsidian...</p>}
                  {activeStep === 2 && <p className="text-purple-400">» Leo (Script): Schreibe Skript basierend auf Mias Format & Elenas Fakten...</p>}
                  {activeStep === 3 && <p className="text-amber-400">» Sarah (QA): Prüfe Leos Skript... Hook ist 2.8 Sek, CTA vorhanden. Freigabe erteilt!</p>}
                  {activeStep === 4 && <p className="text-green-400">» Arthur (Voice): Generiere emotionales Voiceover (ElevenLabs)...</p>}
                  {activeStep === 5 && <p className="text-pink-400">» Maya (Visuals): Erstelle 4 Assets passend zum POV-Format...</p>}
                  {activeStep === 6 && <p className="text-orange-400">» System: JSON generiert. Starte Remotion Rendervorgang...</p>}
                  {activeStep >= 7 && <p className="text-emerald-400 font-bold flex items-center gap-2 mt-2"><CheckCircle2 className="w-5 h-5" /> Reel fertig für Instagram!</p>}
                </div>
              </div>

              <div className="flex justify-end">
                <button onClick={startPipeline} disabled={isRunning || activeStep > 6} className="bg-white text-slate-900 hover:bg-indigo-50 font-bold py-4 px-8 rounded-xl flex items-center gap-3 transition">
                  {isRunning ? 'Läuft...' : 'Auftrag erteilen'} 
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
