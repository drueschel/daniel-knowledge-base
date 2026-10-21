import { useState, useEffect } from 'react';
import { Sparkles, Video, Mic, Volume2, ShieldAlert, PhoneOff, CheckCircle2, Key, Loader2, HeartHandshake, Maximize2, Minimize2, HelpCircle, X, Settings, ChevronDown, ChevronUp, Save, User, Brain } from 'lucide-react';

export default function RealityCheckLive() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('tavus_api_key') || '');
  const [isConfigured, setIsConfigured] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationUrl, setConversationUrl] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState('');
  const [editedGreeting, setEditedGreeting] = useState('');
  const [selectedReplica, setSelectedReplica] = useState('rc39f215e8cb');
  const [selectedVoice, setSelectedVoice] = useState('384b625b-da5d-49e8-a76d-a2855d4f31eb');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const activePersonaId = 'p10c7cf5763b';

  // Check backend status on mount
  useEffect(() => {
    fetch('http://localhost:4000/api/tavus/status')
      .then(res => res.json())
      .then(data => {
        if (data.configured) {
          setIsConfigured(true);
        } else if (apiKey) {
          setIsConfigured(true);
        }
      })
      .catch(console.error);
  }, [apiKey]);

  // Fetch Persona config on mount
  useEffect(() => {
    fetch(`http://localhost:4000/api/tavus/persona?personaId=${activePersonaId}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.system_prompt) {
          setEditedPrompt(data.system_prompt);
          setEditedGreeting(data.greeting || '');
          setSelectedReplica(data.default_replica_id || 'rc39f215e8cb');
          if (data.layers?.tts?.external_voice_id) {
            setSelectedVoice(data.layers.tts.external_voice_id);
          }
        }
      })
      .catch(console.error);
  }, [activePersonaId]);

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false);
        setShowCheatSheet(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const savePersonaSettings = async () => {
    setIsSavingSettings(true);
    setSaveSuccess(false);
    try {
      const res = await fetch('http://localhost:4000/api/tavus/persona', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personaId: activePersonaId,
          systemPrompt: editedPrompt,
          greeting: editedGreeting,
          replicaId: selectedReplica,
          voiceId: selectedVoice
        })
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const saveApiKey = () => {
    if (!apiKey.trim()) return;
    localStorage.setItem('tavus_api_key', apiKey.trim());
    setIsConfigured(true);
  };

  const startSession = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:4000/api/tavus/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personaId: activePersonaId,
          replicaId: selectedReplica,
          apiKey: apiKey.trim() || undefined,
          testMode: isTestMode
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Fehler beim Starten der Session');
      }

      setConversationId(data.conversationId);
      setConversationUrl(data.conversationUrl);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const endSession = async () => {
    if (conversationId) {
      fetch(`http://localhost:4000/api/tavus/end-session/${conversationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKey.trim() || undefined })
      }).catch(console.error);
    }
    setConversationUrl(null);
    setConversationId(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900 text-white overflow-y-auto p-8">
      {/* Header */}
      <div className="max-w-5xl mx-auto w-full mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-purple-500/20 border border-purple-500/30 rounded-2xl text-purple-400">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-300 to-indigo-300">
              Live Reality-Check (Tavus AI Avatar)
            </h1>
            <p className="text-slate-400 text-sm">
              Echtzeit-Projektionsauflösung nach Gopal Norbert Klein & NARM mit einem lebensechten KI-Gegenüber.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Video Room or Start Panel */}
        <div className="lg:col-span-2 flex flex-col">
          {conversationUrl ? (
            /* Active Live Video Stream */
            <div className="bg-slate-950 border border-purple-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[650px] relative">
              <iframe
                src={conversationUrl}
                allow="camera; microphone; display-capture; autoplay"
                className="w-full flex-1 border-0"
                title="Tavus Live Reality-Check"
              />
              <div className="p-4 bg-slate-900/90 backdrop-blur border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
                  <span className="text-sm font-medium text-emerald-400">Live Verbindung aktiv (WebRTC)</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsFullscreen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl transition-all border border-slate-700 hover:border-purple-500/50"
                    title="Vollbildmodus aktivieren"
                  >
                    <Maximize2 className="w-4 h-4 text-purple-400" />
                    Vollbild
                  </button>
                  <button
                    onClick={endSession}
                    className="flex items-center gap-2 px-5 py-2.5 bg-red-600/80 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-all shadow-lg"
                  >
                    <PhoneOff className="w-4 h-4" />
                    Gespräch beenden
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Setup / Pre-Call Card */
            <div className="bg-slate-800/50 border border-slate-700/60 rounded-3xl p-8 flex flex-col justify-between min-h-[650px]">
              <div>
                <div className="w-16 h-16 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400 mb-6">
                  <Video className="w-8 h-8" />
                </div>
                
                <h2 className="text-xl font-bold mb-3">Bereit für den Reality-Check?</h2>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  Der Avatar schaut dich an, hält Augenkontakt, hört dir über dein Mikrofon zu und antwortet in Echtzeit mit menschlicher Mimik. 
                  Er ist darauf programmiert, deine kindlichen Gefahrenprojektionen zu entkräften, Stille auszuhalten und dir maximale Sicherheit zu spiegeln.
                </p>

                {/* Gopal Modus B Active Card */}
                <div className="mb-6 p-4 rounded-2xl border bg-purple-950/40 border-purple-500 shadow-lg shadow-purple-900/30 ring-1 ring-purple-500/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-400" />
                      <span className="text-base font-bold text-white">
                        Gopal Live-Sitzungsleiter (Modus B)
                      </span>
                    </div>
                    <span className="text-[11px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-0.5 rounded-full font-semibold">
                      Aktiv & Geführt
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Führt die Sitzung intuitiv nach Gopal Norbert Klein: Unterbricht Kulissengeschichten, übersetzt Körperschmerzen auf die Bindungsebene, aktiviert die kindliche Bedrohung im Cortex und leitet gezielt den Somatischen Reality-Check an.
                  </p>
                </div>

                {/* Status Indicator & Settings Toggle */}
                {isConfigured ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-emerald-300">
                          Gopal Sitzungsleiter (Modus B) verbunden
                        </div>
                        <div className="text-xs text-emerald-400/80">Tavus v2 API aktiv • Persona {activePersonaId}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-all hover:border-purple-500/50"
                        title="Einstellungen & Prompt anpassen"
                      >
                        <Settings className="w-3.5 h-3.5 text-purple-400" />
                        <span>PAL anpassen</span>
                        {showSettings ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
                      </button>
                      <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/30">
                        Bereit
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-semibold">Tavus API-Schlüssel</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        placeholder="Deinen Tavus API-Key einfügen (z.B. tavus_...)"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="flex-1 px-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                      />
                      <button
                        onClick={saveApiKey}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-xl transition-all"
                      >
                        Speichern
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Wird sicher in deinem Browser und der Backend-Session gehalten.
                    </p>
                  </div>
                )}

                {/* PAL Customizer Accordion Panel */}
                {showSettings && (
                  <div className="bg-slate-900/90 border border-purple-500/30 p-5 rounded-2xl mb-6 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2 text-sm font-bold text-purple-300">
                        <Settings className="w-4 h-4 text-purple-400" />
                        <span>PAL Persona & Regelwerk Konfiguration</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">ID: {activePersonaId} • Gopal Modus B</span>
                    </div>

                    {/* Replica selection */}
                    <div>
                      <label className="text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-purple-400" />
                        Avatar / Replica Aussehen
                      </label>
                      <select
                        value={selectedReplica}
                        onChange={(e) => setSelectedReplica(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="rc39f215e8cb">Daniel (Stock Library - Standard)</option>
                        <option value="rff4f230c435">Thomas (Freundlicher Mann, professionell)</option>
                        <option value="r79996137c01">Jamie (Ruhiger Gesprächspartner)</option>
                        <option value="r4067604db72">Lucy (Einfühlsame Frau)</option>
                        <option value="r1ce7f5b22d4">Maya (Ruhige Therapeutin)</option>
                      </select>
                    </div>

                    {/* German Voice selection */}
                    <div>
                      <label className="text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                        <Volume2 className="w-3.5 h-3.5 text-purple-400" />
                        Deutsche Stimme (Akzentfreies Hochdeutsch)
                      </label>
                      <select
                        value={selectedVoice}
                        onChange={(e) => setSelectedVoice(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="384b625b-da5d-49e8-a76d-a2855d4f31eb">
                          Deutscher Mann (German Conversation Man - Natürlich & Warm)
                        </option>
                        <option value="db229dfe-f5de-4be4-91fd-7b077c158578">
                          Deutscher Mann (German Storyteller Man - Ruhig, Tief & Getragen)
                        </option>
                        <option value="3f4ade23-6eb4-4279-ab05-6a144947c4d5">
                          Deutsche Frau (German Conversational Woman - Sanft & Klar)
                        </option>
                      </select>
                    </div>

                    {/* Greeting */}
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Begrüßung (Erster Satz beim Verbinden)
                      </label>
                      <input
                        type="text"
                        value={editedGreeting}
                        onChange={(e) => setEditedGreeting(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                        placeholder="z.B. Ich bin da und ich höre dir zu."
                      />
                    </div>

                    {/* System Prompt / Rules */}
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        System-Prompt & Gopal-Verhaltensregeln (Tavus Persona)
                      </label>
                      <textarea
                        rows={7}
                        value={editedPrompt}
                        onChange={(e) => setEditedPrompt(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500 leading-relaxed"
                        placeholder="System-Prompt für die Tavus Persona..."
                      />
                      <p className="text-[11px] text-slate-400 mt-1">
                        Hier sind die Kernregeln: Vollständige Satz-Wiederholung, absolut keine Gegenfragen, Stille nach der Antwort.
                      </p>
                    </div>

                    {/* Save Button */}
                    <div className="flex items-center justify-between pt-2">
                      {saveSuccess ? (
                        <span className="text-xs text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Auf Tavus Persona gespeichert!
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500">
                          Wird direkt in die Tavus Cloud synchronisiert.
                        </span>
                      )}
                      <button
                        onClick={savePersonaSettings}
                        disabled={isSavingSettings}
                        className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all shadow-md"
                      >
                        {isSavingSettings ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Speichern...
                          </>
                        ) : (
                          <>
                            <Save className="w-3.5 h-3.5" />
                            Persona speichern
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Dev Test Mode Toggle */}
                <div className="flex items-center justify-between p-3 mb-4 bg-slate-900/60 border border-slate-700/60 rounded-xl">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-300">Entwickler Test-Modus (test_mode)</span>
                    <span className="text-[11px] text-slate-400">Prüft API kostenlos (Avatar-Video bleibt deaktiviert)</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isTestMode}
                      onChange={(e) => setIsTestMode(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-start gap-3 mb-4">
                    <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              <div>
                <button
                  onClick={startSession}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold rounded-2xl shadow-xl transition-all text-base"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Avatar verbindet sich...
                    </>
                  ) : (
                    <>
                      <Video className="w-5 h-5" />
                      Live-Avatar starten
                    </>
                  )}
                </button>
                <div className="flex items-center justify-center gap-4 mt-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5"><Mic className="w-3.5 h-3.5" /> Mikrofon aktiv</span>
                  <span className="flex items-center gap-1.5"><Volume2 className="w-3.5 h-3.5" /> Sub-Sekunden Audio</span>
                  <span className="flex items-center gap-1.5"><HeartHandshake className="w-3.5 h-3.5" /> Sicherer Raum</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Gopal Reality-Check Leitfaden */}
        <div className="space-y-6">
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6">
            <h3 className="text-base font-bold text-purple-300 mb-2 flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              Gopals 5-Phasen Ablauf (Geführt)
            </h3>
            
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Der Avatar führt dich aktiv durch die Sitzung. Folge seinen Instruktionen und halte Augenkontakt:
            </p>

            <div className="space-y-3">
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
                <span className="text-xs text-purple-400 font-bold block mb-0.5">1. Kulissen-Stopp</span>
                <p className="text-xs text-slate-300">
                  Keine langen Alltags-Geschichten. Der Avatar fokussiert dich sofort auf das Erleben im Hier & Jetzt.
                </p>
              </div>

              <div className="p-3 bg-slate-900/60 border border-purple-500/30 rounded-xl bg-purple-950/20">
                <span className="text-xs text-pink-400 font-bold block mb-0.5">2. Biologische Angst aktivieren</span>
                <p className="text-xs text-slate-200">
                  „Was droht dir von mir?“ – Die kindliche Gefahr muss im Cortex fühlbar werden, damit das Nervensystem bereit für das Update ist.
                </p>
              </div>

              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
                <span className="text-xs text-purple-400 font-bold block mb-0.5">3. Geführter Reality-Check</span>
                <p className="text-xs text-slate-300">
                  Der Avatar weist dich an, die Kernfrage direkt in seine Augen laut auszusprechen.
                </p>
              </div>

              <div className="p-3 bg-slate-900/60 border border-emerald-500/30 rounded-xl bg-emerald-950/20">
                <span className="text-xs text-emerald-400 font-bold block mb-0.5">4. Prediction Error & Entlastung</span>
                <p className="text-xs text-slate-200">
                  Der Avatar antwortet im vollen Satz: „Nein. Ich verlasse dich nicht. Und ich brauche keine Betreuung von dir.“
                </p>
              </div>

              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
                <span className="text-xs text-indigo-400 font-bold block mb-0.5">5. Vegetative Entladung & Stille</span>
                <p className="text-xs text-slate-300">
                  Druckabfall, Seufzen, Tränen. Der Avatar hält den sicheren Raum in Stille.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-950/20 border border-purple-500/20 rounded-2xl p-5 text-xs text-purple-200/80 leading-relaxed">
            <strong className="text-purple-300 block mb-1">Neurobiologischer Tipp:</strong>
            Atme tief in den Bauch aus, sobald der Avatar dir antwortet. Die Amygdala erwartet eine Abfuhr – erfährt sie Sicherheit, schüttet der Kortex GABA aus und überschreibt das Bindungstrauma.
          </div>
        </div>

      </div>

      {/* Fullscreen Video Overlay */}
      {conversationUrl && isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col w-screen h-screen overflow-hidden animate-in fade-in duration-200">
          <div className="relative flex-1 w-full h-full bg-black flex items-center justify-center">
            <iframe
              src={conversationUrl}
              allow="camera; microphone; display-capture; autoplay"
              className="w-full h-full border-0 absolute inset-0"
              title="Tavus Live Reality-Check Fullscreen"
            />

            {/* Floating Cheat-Sheet Overlay on Right */}
            {showCheatSheet && (
              <div className="absolute top-6 right-6 z-20 w-96 bg-slate-900/95 backdrop-blur-md border border-purple-500/30 rounded-3xl p-6 shadow-2xl animate-in slide-in-from-right duration-200 text-white">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                  <h3 className="font-bold text-sm text-purple-300 flex items-center gap-2">
                    <Brain className="w-4 h-4 text-purple-400" />
                    Gopals 5-Phasen Ablauf
                  </h3>
                  <button onClick={() => setShowCheatSheet(false)} className="text-slate-400 hover:text-white p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/50">
                    <strong className="text-purple-400 block">1. Kulissen-Stopp</strong>
                    Keine langen Alltags-Geschichten. Im Hier & Jetzt bleiben.
                  </div>
                  <div className="p-2.5 bg-purple-950/40 rounded-xl border border-pink-500/30">
                    <strong className="text-pink-400 block">2. Angst im Cortex aktivieren</strong>
                    „Was droht dir von mir?“ – Das Nervensystem für das Update laden.
                  </div>
                  <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/50">
                    <strong className="text-purple-400 block">3. Geführter Reality-Check</strong>
                    Kernfrage dem Avatar direkt in die Augen stellen.
                  </div>
                  <div className="p-2.5 bg-emerald-950/40 rounded-xl border border-emerald-500/30">
                    <strong className="text-emerald-400 block">4. Prediction Error</strong>
                    Avatar entkräftet die Gefahr im vollen Satz & bricht die Projektion.
                  </div>
                  <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/50">
                    <strong className="text-indigo-400 block">5. Vegetative Entladung</strong>
                    Atmen, weinen oder Stille – der Raum wird gehalten.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Floating Control Bar */}
          <div className="p-4 bg-slate-950/80 backdrop-blur-md border-t border-slate-800/80 flex items-center justify-between px-8 z-10">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
              <span className="text-xs font-semibold text-emerald-400 tracking-wide">LIVE REALITY-CHECK (VOLLBILD)</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCheatSheet(!showCheatSheet)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${showCheatSheet ? 'bg-purple-600/40 text-purple-200 border-purple-500' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border-slate-700'}`}
              >
                <HelpCircle className="w-4 h-4 text-purple-400" />
                {showCheatSheet ? 'Leitfragen ausblenden' : 'Leitfragen einblenden'}
              </button>

              <button
                onClick={() => setIsFullscreen(false)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all border border-slate-700"
                title="Vollbild beenden (ESC)"
              >
                <Minimize2 className="w-4 h-4" />
                Vollbild beenden (ESC)
              </button>

              <button
                onClick={() => { setIsFullscreen(false); endSession(); }}
                className="flex items-center gap-2 px-5 py-2 bg-red-600/90 hover:bg-red-600 text-white text-xs font-semibold rounded-xl transition-all shadow-lg"
              >
                <PhoneOff className="w-4 h-4" />
                Gespräch beenden
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
