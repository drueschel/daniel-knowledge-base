const fs = require('fs');
let code = fs.readFileSync('agentic-cockpit/src/App.tsx', 'utf8');

// Remove the old simple steps 6 and 7
code = code.replace(/                    if \(activeStep === 6\) return <div className="text-orange-600 font-bold animate-pulse flex items-center gap-2">[\s\S]*?<\/div>\n                    \);\n/m, "");

// Rewrite steps 5+ to be a unified UI
const oldUnifiedSteps = `                    if (activeStep === 5) {
                      return (
                        <div className="animate-in fade-in slide-in-from-bottom-2">
                          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl mb-4 text-emerald-700">
                            <p className="font-bold flex items-center gap-2"><CheckCircle2 className="w-5 h-5"/> Phase 1 abgeschlossen.</p>
                            <p className="text-sm mt-1">Das Skript hat die QA bestanden. Wähle direkt hier deinen Hook, um Hephaistos (Voiceover) zu starten.</p>
                          </div>
                          <div className="grid gap-3">
                            {['hook_1', 'hook_2', 'hook_3'].map((h, i) => {
                              const hookText = activePiece.qaData?.final_script?.[h] || activePiece.scriptData?.[h];
                              if (!hookText) return null;
                              return (
                                <button 
                                  key={h}
                                  onClick={() => approveHook(activePiece.id, h)}
                                  className="text-left p-4 rounded-xl border-2 bg-white border-slate-200 hover:border-indigo-500 hover:shadow-md transition-all group"
                                >
                                  <div className="flex justify-between items-center mb-1">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-indigo-500 transition-colors">Option {i+1}</p>
                                    <Play className="w-4 h-4 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                  <p className="text-sm text-slate-900 leading-relaxed">{hookText}</p>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }
                    
                    if (activeStep === 6) {
                      if (activePiece.status === 'voiceover') {
                        return <div className="text-blue-600 font-bold animate-pulse text-lg flex items-center gap-3 p-6 bg-blue-50 rounded-xl border border-blue-100 shadow-inner"><Wand2 className="w-6 h-6 animate-spin" /> Hephaistos generiert das Voiceover (ElevenLabs)...</div>;
                      }
                      return (
                        <div className="animate-in fade-in slide-in-from-bottom-2">
                          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-4 text-blue-700">
                            <p className="font-bold flex items-center gap-2"><CheckCircle2 className="w-5 h-5"/> Audio bereit.</p>
                            <p className="text-sm mt-1">Hephaistos hat das Voiceover erstellt. Du kannst es jetzt probehören oder das Video rendern.</p>
                          </div>
                          <audio controls className="w-full mb-4 h-12 rounded-lg bg-slate-50 border border-slate-200 shadow-sm" src={\`\${activePiece.audioUrl}?t=\${new Date(activePiece.updatedAt).getTime()}\`} />
                          <div className="flex gap-4">
                            <button onClick={() => renderVideo(activePiece.id)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-4 rounded-lg font-bold shadow-sm transition-colors flex-1 flex items-center justify-center gap-2 text-lg">
                              <Play className="w-5 h-5" /> Video Rendern (Maya)
                            </button>
                            <button onClick={() => approveHook(activePiece.id, activePiece.selectedHook!)} className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-4 rounded-lg font-bold shadow-sm transition-colors flex items-center justify-center gap-2">
                              <RefreshCcw className="w-5 h-5" /> Neu vertonen
                            </button>
                          </div>
                        </div>
                      );
                    }
                    
                    if (activeStep === 7) {
                      return <div className="text-indigo-600 font-bold animate-pulse text-lg flex items-center gap-3 p-6 bg-indigo-50 rounded-xl border border-indigo-100 shadow-inner"><Wand2 className="w-6 h-6 animate-spin" /> Maya & HyperFrames rendern das Video...</div>;
                    }
                    
                    if (activeStep >= 8) {
                      return (
                        <div className="animate-in fade-in slide-in-from-bottom-2">
                          <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl mb-4 text-purple-700 flex justify-between items-center">
                            <div>
                              <p className="font-bold flex items-center gap-2"><CheckCircle2 className="w-5 h-5"/> Video fertig gerendert!</p>
                              <p className="text-sm mt-1">Das Video liegt bereit zur Distribution auf Instagram (Aphrodite).</p>
                            </div>
                          </div>
                          
                          <div className="mb-6 rounded-xl overflow-hidden border-4 border-slate-200 shadow-md bg-black">
                            <video controls className="w-full max-h-[500px]" src={\`\${activePiece.videoUrl?.startsWith('http') ? activePiece.videoUrl : \`http://localhost:4000\${activePiece.videoUrl}\`}?t=\${new Date(activePiece.updatedAt).getTime()}\`} />
                          </div>`;

const newUnifiedSteps = `                    if (activeStep >= 5) {
                      const isRendering = activePiece.status === 'voiceover' || activePiece.status === 'visuals' || activePiece.status === 'render';
                      const isFinished = activePiece.status === 'completed' || activeStep >= 8;
                      const hasAudio = activePiece.audioUrl && !isRendering && !isFinished;
                      
                      return (
                        <div className="animate-in fade-in slide-in-from-bottom-2">
                          {!activePiece.selectedHook ? (
                            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl mb-4 text-emerald-700">
                              <p className="font-bold flex items-center gap-2"><CheckCircle2 className="w-5 h-5"/> Phase 1 abgeschlossen.</p>
                              <p className="text-sm mt-1">Das Skript hat die QA bestanden. Wähle direkt hier deinen Hook, um Hephaistos (Voiceover) zu starten.</p>
                            </div>
                          ) : (
                            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl mb-4 text-indigo-700">
                              <p className="font-bold flex items-center gap-2"><Wand2 className="w-5 h-5"/> Produktion läuft (Phase 2)</p>
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
                                  <div className={\`flex items-center gap-3 transition-opacity \${activePiece.status === 'voiceover' || activePiece.status === 'visuals' || activePiece.status === 'render' ? 'opacity-100 text-blue-600' : 'opacity-30'}\`}>
                                    {activePiece.status === 'visuals' || activePiece.status === 'render' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
                                    <span>Hephaistos generiert Voiceover (ElevenLabs)...</span>
                                  </div>
                                  <div className={\`flex items-center gap-3 transition-opacity \${activePiece.status === 'visuals' || activePiece.status === 'render' ? 'opacity-100 text-purple-600' : 'opacity-30'}\`}>
                                    {activePiece.status === 'render' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : (activePiece.status === 'visuals' ? <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div> : <div className="w-5 h-5 rounded-full border-2 border-slate-200"></div>)}
                                    <span>Maya erstellt Bildkomposition & Visuals...</span>
                                  </div>
                                  <div className={\`flex items-center gap-3 transition-opacity \${activePiece.status === 'render' ? 'opacity-100 text-orange-600' : 'opacity-30'}\`}>
                                    {activePiece.status === 'completed' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : (activePiece.status === 'render' ? <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div> : <div className="w-5 h-5 rounded-full border-2 border-slate-200"></div>)}
                                    <span>HyperFrames rendert das finale Video...</span>
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
                              ) : hasAudio ? (
                                <div>
                                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-4 text-blue-700">
                                    <p className="font-bold flex items-center gap-2"><CheckCircle2 className="w-5 h-5"/> Audio bereit.</p>
                                    <p className="text-sm mt-1">Hephaistos hat das Voiceover erstellt. Du kannst es jetzt probehören oder das Video rendern.</p>
                                  </div>
                                  <audio controls className="w-full mb-4 h-12 rounded-lg bg-slate-50 border border-slate-200 shadow-sm" src={\`\${activePiece.audioUrl}?t=\${new Date(activePiece.updatedAt).getTime()}\`} />
                                  <div className="flex gap-4">
                                    <button onClick={() => renderVideo(activePiece.id)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-4 rounded-lg font-bold shadow-sm transition-colors flex-1 flex items-center justify-center gap-2 text-lg">
                                      <Play className="w-5 h-5" /> Video Rendern (Maya)
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
                    }`;

// Since the old string is very large and might have small whitespace differences,
// we'll replace everything from "if (activeStep === 5) {" up to the end of the activeStep 8 block
code = code.replace(/                    if \(activeStep === 5\) \{[\s\S]*?<\/div>\n                    \}/, newUnifiedSteps);

fs.writeFileSync('agentic-cockpit/src/App.tsx', code);
