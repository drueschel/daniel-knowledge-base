const fs = require('fs');
let code = fs.readFileSync('agentic-cockpit/src/App.tsx', 'utf8');

// 1. We need to add a generateVisuals function
const generateVisualsFunc = `  const generateVisuals = async (id: string) => {
    try {
      showToast('Generiere Storyboard (Maya)...', 'info');
      await fetch(\`http://localhost:4000/api/content/\${id}/visuals\`, { method: 'POST' });
    } catch (e) {
      showToast('Fehler bei Maya.', 'error');
    }
  };

  const renderVideo = async (id: string) => {`;
code = code.replace(/  const renderVideo = async \(id: string\) => \{/, generateVisualsFunc);

// 2. We rewrite the unified block completely.
// Since the string is large, let's use a regex that matches from `if (activeStep >= 5) {` until `if (activeTab === 'hub') {` (or the end of that block)
const unifiedBlockRegex = /if \(activeStep >= 5\) \{[\s\S]*?(?=\s*if \(activeTab === 'hub'\))/;

const newUnifiedBlock = `if (activeStep >= 5) {
                      const isRendering = activePiece.status === 'voiceover' || activePiece.status === 'visuals' || activePiece.status === 'rendering';
                      const isFinished = activePiece.status === 'completed' || activeStep >= 8;
                      const hasAudio = activePiece.audioUrl && !isRendering && !isFinished && activePiece.status === 'audio_ready';
                      const hasStoryboard = activePiece.storyboard && !isRendering && !isFinished && activePiece.status === 'visuals_ready';
                      
                      return (
                        <div className="animate-in fade-in slide-in-from-bottom-2">
                          {!activePiece.selectedHook ? (
                            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl mb-4 text-emerald-700">
                              <p className="font-bold flex items-center gap-2"><CheckCircle2 className="w-5 h-5"/> Phase 1 abgeschlossen.</p>
                              <p className="text-sm mt-1">Das Skript hat die QA bestanden. Wähle direkt hier deinen Hook, um Hephaistos (Voiceover) zu starten.</p>
                            </div>
                          ) : (
                            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl mb-4 text-indigo-700">
                              <p className="font-bold flex items-center gap-2"><Wand2 className="w-5 h-5"/> Produktion läuft (Phase 2 & 3)</p>
                              <p className="text-sm mt-1">Die ausgewählte Hook wird verarbeitet. Du kannst den Fortschritt unten live verfolgen.</p>
                            </div>
                          )}
                          
                          {/* Hook Selection (Persistent) */}
                          <div className="grid gap-3 mb-6">
                            {['hook_1', 'hook_2', 'hook_3'].map((h, i) => {
                              const hookText = activePiece.qaData?.final_script?.[h] || activePiece.scriptData?.[h];
                              if (!hookText) return null;
                              
                              const isSelected = activePiece.selectedHook === h;
                              const isDisabled = activePiece.selectedHook && !isSelected;
                              
                              return (
                                <button 
                                  key={h}
                                  onClick={() => !activePiece.selectedHook && approveHook(activePiece.id, h)}
                                  disabled={!!activePiece.selectedHook}
                                  className={\`text-left p-4 rounded-xl border-2 transition-all group \${
                                    isSelected ? 'bg-indigo-50 border-indigo-500 shadow-md ring-2 ring-indigo-200' :
                                    isDisabled ? 'bg-slate-50 border-slate-200 opacity-40 grayscale cursor-not-allowed' :
                                    'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-md cursor-pointer'
                                  }\`}
                                >
                                  <div className="flex justify-between items-center mb-1">
                                    <p className={\`text-xs font-bold uppercase tracking-wider transition-colors \${isSelected ? 'text-indigo-700' : 'text-slate-500 group-hover:text-indigo-500'}\`}>Option {i+1} {isSelected && '(Ausgewählt)'}</p>
                                    {!isDisabled && <Play className={\`w-4 h-4 \${isSelected ? 'text-indigo-600' : 'text-indigo-400 opacity-0 group-hover:opacity-100'} transition-opacity\`} />}
                                  </div>
                                  <p className={\`text-sm leading-relaxed \${isSelected ? 'text-indigo-900 font-medium' : 'text-slate-900'}\`}>{hookText}</p>
                                </button>
                              );
                            })}
                          </div>

                          {/* Progress Tracker / Player */}
                          {activePiece.selectedHook && (
                            <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
                              {isRendering ? (
                                <div className="space-y-4">
                                  <h4 className="font-bold text-slate-700 flex items-center gap-2 mb-4">
                                    <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div> 
                                    Pipeline Status
                                  </h4>
                                  <div className={\`flex items-center gap-3 transition-opacity \${activePiece.status === 'voiceover' || activePiece.status === 'visuals' || activePiece.status === 'rendering' ? 'opacity-100 text-blue-600' : 'opacity-30'}\`}>
                                    {activePiece.status === 'visuals' || activePiece.status === 'visuals_ready' || activePiece.status === 'rendering' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
                                    <span>Hephaistos generiert Voiceover (ElevenLabs) & Timestamps (Whisper)...</span>
                                  </div>
                                  <div className={\`flex items-center gap-3 transition-opacity \${activePiece.status === 'visuals' || activePiece.status === 'rendering' ? 'opacity-100 text-purple-600' : 'opacity-30'}\`}>
                                    {activePiece.status === 'rendering' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : (activePiece.status === 'visuals' ? <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div> : <div className="w-5 h-5 rounded-full border-2 border-slate-200"></div>)}
                                    <span>Maya erstellt 3D-Metaphern (Higgsfield) & Storyboard...</span>
                                  </div>
                                  <div className={\`flex items-center gap-3 transition-opacity \${activePiece.status === 'rendering' ? 'opacity-100 text-orange-600' : 'opacity-30'}\`}>
                                    {activePiece.status === 'completed' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : (activePiece.status === 'rendering' ? <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div> : <div className="w-5 h-5 rounded-full border-2 border-slate-200"></div>)}
                                    <span>HyperFrames rendert das finale Video synchron...</span>
                                  </div>
                                </div>
                              ) : isFinished ? (
                                <div>
                                  <div className="mb-6 rounded-xl overflow-hidden border-4 border-slate-200 shadow-md bg-black">
                                    <video controls className="w-full max-h-[500px]" src={\`\${activePiece.videoUrl?.startsWith('http') ? activePiece.videoUrl : \`http://localhost:4000\${activePiece.videoUrl}\`}?t=\${new Date(activePiece.updatedAt).getTime()}\`} />
                                  </div>
                                  <div className="flex gap-4">
                                    <button onClick={() => {
                                      showToast('Rendern erneut gestartet...', 'info');
                                      renderVideo(activePiece.id);
                                    }} className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-4 rounded-lg font-bold shadow-sm transition-colors flex items-center justify-center gap-2">
                                      <RefreshCcw className="w-5 h-5" /> Neu Rendern
                                    </button>
                                  </div>
                                </div>
                              ) : hasStoryboard ? (
                                <div>
                                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl mb-4 text-purple-700">
                                    <p className="font-bold flex items-center gap-2"><CheckCircle2 className="w-5 h-5"/> Storyboard QA (Abnahme)</p>
                                    <p className="text-sm mt-1">Maya hat die 3D-Metaphern generiert. Prüfe die Bildsprache (0,5s Methode), bevor wir final rendern.</p>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                                    {activePiece.storyboard?.map((frame: any) => (
                                      <div key={frame.id} className="relative group rounded-lg overflow-hidden border-2 border-slate-200 shadow-sm">
                                        <img src={frame.imageUrl} alt="Storyboard frame" className="w-full aspect-square object-cover" />
                                        <div className="absolute inset-x-0 bottom-0 bg-black/70 p-2 transform translate-y-full group-hover:translate-y-0 transition-transform">
                                          <p className="text-xs text-white line-clamp-2">{frame.voice}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  
                                  <div className="flex gap-4">
                                    <button onClick={() => renderVideo(activePiece.id)} className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-4 rounded-lg font-bold shadow-sm transition-colors flex-1 flex items-center justify-center gap-2 text-lg">
                                      <Play className="w-5 h-5" /> Storyboard OK - Final Rendern
                                    </button>
                                    <button onClick={() => generateVisuals(activePiece.id)} className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-4 rounded-lg font-bold shadow-sm transition-colors flex items-center justify-center gap-2">
                                      <RefreshCcw className="w-5 h-5" /> Assets neu generieren
                                    </button>
                                  </div>
                                </div>
                              ) : hasAudio ? (
                                <div>
                                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-4 text-blue-700">
                                    <p className="font-bold flex items-center gap-2"><CheckCircle2 className="w-5 h-5"/> Audio & Timestamps bereit.</p>
                                    <p className="text-sm mt-1">Hephaistos hat das Voiceover erstellt und Whisper die Zeiten gemessen. Starte jetzt Maya für die Visuals.</p>
                                  </div>
                                  <audio controls className="w-full mb-4 h-12 rounded-lg bg-slate-50 border border-slate-200 shadow-sm" src={\`\${activePiece.audioUrl}?t=\${new Date(activePiece.updatedAt).getTime()}\`} />
                                  
                                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-4 h-32 overflow-y-auto">
                                    <p className="text-xs font-bold text-slate-500 mb-2 uppercase">Whisper Timestamp Data (Vorschau)</p>
                                    <div className="flex flex-wrap gap-1">
                                      {activePiece.timestamps?.map((ts: any, idx: number) => (
                                        <span key={idx} className="text-xs bg-indigo-100 text-indigo-700 px-1 rounded border border-indigo-200" title={\`\${ts.start}s - \${ts.end}s\`}>{ts.word}</span>
                                      ))}
                                    </div>
                                  </div>
                                  
                                  <div className="flex gap-4">
                                    <button onClick={() => generateVisuals(activePiece.id)} className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-4 rounded-lg font-bold shadow-sm transition-colors flex-1 flex items-center justify-center gap-2 text-lg">
                                      <Play className="w-5 h-5" /> Visuals generieren (Maya)
                                    </button>
                                    <button onClick={() => approveHook(activePiece.id, activePiece.selectedHook!)} className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-4 rounded-lg font-bold shadow-sm transition-colors flex items-center justify-center gap-2">
                                      <RefreshCcw className="w-5 h-5" /> Neu vertonen
                                    </button>
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          )}
                        </div>
                      );
                    }
                    
                    `;

code = code.replace(unifiedBlockRegex, newUnifiedBlock);

// 3. Update activeStep logic for visual nodes (make sure the 'render' icon highlights appropriately)
// If status is visuals_ready or visuals, we are on Maya (idx 5)
// Let's modify checkPipelineStatus
code = code.replace(
  /if \(\['voiceover', 'visuals', 'render'\]\.includes\(state\.status\)\) \{/,
  "if (['voiceover', 'visuals', 'visuals_ready', 'rendering'].includes(state.status)) {"
);

fs.writeFileSync('agentic-cockpit/src/App.tsx', code);
