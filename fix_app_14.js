const fs = require('fs');
let code = fs.readFileSync('agentic-cockpit/src/App.tsx', 'utf8');

const regex = /if \(activeStep === 6\)[\s\S]*?if \(activeStep === 5\) \{[\s\S]*?return \([\s\S]*?<div className="grid gap-3">[\s\S]*?\{ \}\) \} \)/g;

// Instead of complex regex, let's just find the exact block and replace it using string split/join or substring

const oldStep6 = `if (activeStep === 6) return <div className="text-orange-600 font-bold animate-pulse flex items-center gap-2"><div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div> Hephaistos (Voiceover) & HyperFrames (Rendern) laufen... (das kann ca. 2-3 Minuten dauern)</div>;`;

const newUI = `
                    if (activeStep >= 5) {
                      const isProcessing = activeStep === 6;
                      const isFinished = activeStep === 7;
                      
                      return (
                        <div className="animate-in fade-in slide-in-from-bottom-2">
                          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl mb-4 text-emerald-700">
                            <p className="font-bold flex items-center gap-2"><CheckCircle2 className="w-5 h-5"/> Phase 1 abgeschlossen.</p>
                            <p className="text-sm mt-1">{isProcessing || isFinished ? 'Ausgewählter Hook (Produktion gestartet):' : 'Das Skript hat die QA bestanden. Wähle direkt hier deinen Hook, um die Video-Produktion zu starten.'}</p>
                          </div>
                          
                          <div className="grid gap-3 mb-6">
                            {['hook_1', 'hook_2', 'hook_3'].map((h, i) => {
                              const hookText = activePiece.qaData?.final_script?.[h] || activePiece.scriptData?.[h];
                              if (!hookText) return null;
                              
                              const isSelected = activePiece.selectedHook === h;
                              const showOnlySelected = isProcessing || isFinished;
                              if (showOnlySelected && !isSelected) return null;
                              
                              return (
                                <button 
                                  key={h}
                                  onClick={() => !isProcessing && !isFinished && approveHook(activePiece.id, h)}
                                  disabled={isProcessing || isFinished}
                                  className={\`text-left p-4 rounded-xl border-2 transition-all \${
                                    isSelected 
                                      ? 'bg-indigo-50 border-indigo-500 shadow-md ring-2 ring-indigo-200 cursor-default' 
                                      : (isProcessing || isFinished) ? 'opacity-50 grayscale cursor-not-allowed' : 'bg-white border-slate-200 hover:border-indigo-500 hover:shadow-md group'
                                  }\`}
                                >
                                  <p className={\`text-xs font-bold mb-1 \${isSelected ? 'text-indigo-600' : 'text-slate-500 group-hover:text-indigo-500'}\`}>OPTION {i + 1} {isSelected && '✓'}</p>
                                  <p className="text-slate-800">{hookText}</p>
                                </button>
                              )
                            })}
                          </div>
                          
                          {isProcessing && (
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-inner animate-in fade-in">
                               <h4 className="font-bold mb-6 flex items-center gap-2 text-slate-800"><Wand2 className="w-5 h-5 text-indigo-500 animate-pulse"/> Video wird produziert (ca. 2-3 Minuten)</h4>
                               
                               <div className="space-y-4">
                                  <div className={\`flex items-center gap-3 \${activePiece.status === 'voiceover' ? 'text-indigo-600 font-bold' : 'text-slate-600'}\`}>
                                    {activePiece.status === 'voiceover' ? <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div> : <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                                    <span className="flex-1">Hephaistos generiert AI-Voiceover (ElevenLabs)</span>
                                  </div>
                                  <div className={\`flex items-center gap-3 \${activePiece.status === 'visuals' ? 'text-indigo-600 font-bold' : (['render', 'completed', 'production'].includes(activePiece.status) ? 'text-slate-600' : 'text-slate-400')}\`}>
                                    {activePiece.status === 'visuals' ? <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div> : (['render', 'completed', 'production'].includes(activePiece.status) ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-300"></div>)}
                                    <span className="flex-1">Maya analysiert visuelle Hooks & Bildideen</span>
                                  </div>
                                  <div className={\`flex items-center gap-3 \${activePiece.status === 'render' ? 'text-orange-600 font-bold' : (['completed', 'production'].includes(activePiece.status) ? 'text-slate-600' : 'text-slate-400')}\`}>
                                    {activePiece.status === 'render' ? <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div> : (['completed', 'production'].includes(activePiece.status) ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-300"></div>)}
                                    <span className="flex-1">HyperFrames komponiert das finale Video (Frame by Frame)</span>
                                  </div>
                               </div>
                            </div>
                          )}
                          
                          {isFinished && (
                             <div className="p-6 bg-indigo-50 border border-indigo-200 rounded-xl mt-4 text-indigo-900 shadow-sm text-center animate-in zoom-in-95">
                                <h4 className="font-extrabold flex items-center justify-center gap-2 mb-2 text-xl"><CheckCircle2 className="w-6 h-6"/> E2E Produktion erfolgreich!</h4>
                                <p className="text-sm mb-6">Dein Video wurde vollständig gerendert und ist nun bereit zur Veröffentlichung.</p>
                                <div className="flex gap-4 max-w-lg mx-auto">
                                   <button onClick={() => setActiveTab('hub')} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-xl transition shadow-xl flex-1">
                                     Zum Content Hub wechseln
                                   </button>
                                   <button onClick={() => approveHook(activePiece.id, activePiece.selectedHook)} className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold py-3 px-6 rounded-xl transition shadow-sm flex items-center gap-2" title="Gleiches Skript nochmal rendern">
                                     <RefreshCcw className="w-4 h-4" /> Erneut Rendern
                                   </button>
                                </div>
                             </div>
                          )}
                        </div>
                      )
                    }
`;

// Time to splice the file
const startIdx = code.indexOf('if (activeStep === 6)');
const endString = '})()}'; // wait, the IIFE close
const endIdx = code.indexOf('})()}', startIdx);

const newCode = code.substring(0, startIdx) + newUI + code.substring(endIdx);
fs.writeFileSync('agentic-cockpit/src/App.tsx', newCode);
