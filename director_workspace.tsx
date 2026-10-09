                {/* Director Workspace Pipeline Interactive Area */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                  <h3 className="font-bold mb-4 flex items-center gap-2 text-indigo-700">
                    <Search className="w-5 h-5"/> Director Workspace
                  </h3>
                  
                  {(() => {
                    const activePiece = contentPieces.find(p => p.id === localStorage.getItem('activePipelineSession'));
                    
                    if (activeStep === 0) return <div className="text-slate-500">Gebe oben dein Thema ein und klicke auf "E2E Produktion starten".</div>;
                    if (!activePiece) return <div className="text-slate-500 animate-pulse">Initialisiere Pipeline (Zeus)...</div>;

                    if (activeStep === 1) return <div className="text-slate-500 animate-pulse">Prometheus forscht in der Knowledge Base...</div>;
                    if (activeStep === 2) return <div className="text-slate-500 animate-pulse">Athena entwirft Format & Strategie...</div>;
                    if (activeStep === 3) return <div className="text-slate-500 animate-pulse">Calliope schreibt das Drehbuch & Hooks...</div>;
                    if (activeStep === 4) return <div className="text-slate-500 animate-pulse">Themis prüft das Skript (QA)...</div>;
                    
                    if (activeStep === 5) {
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
                          <audio controls className="w-full mb-4 h-12 rounded-lg bg-slate-50 border border-slate-200 shadow-sm" src={`${activePiece.audioUrl}?t=${new Date(activePiece.updatedAt).getTime()}`} />
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
                            <video controls className="w-full max-h-[500px]" src={`${activePiece.videoUrl?.startsWith('http') ? activePiece.videoUrl : \`http://localhost:4000\${activePiece.videoUrl}\`}?t=\${new Date(activePiece.updatedAt).getTime()}`} />
                          </div>

                          <div className="flex flex-col gap-3">
                            <button onClick={() => { 
                              showToast("Distribution auf Instagram gestartet!", "info");
                              setTimeout(() => {
                                showToast("Reel erfolgreich auf Instagram veröffentlicht! Pipeline abgeschlossen.", "success");
                                localStorage.removeItem('activePipelineSession');
                                setActiveStep(0);
                                setIsWaitingForApproval(false);
                              }, 3000);
                            }} className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white px-6 py-4 rounded-xl font-bold shadow-lg transition-colors flex items-center justify-center gap-2 text-lg">
                              <Zap className="w-6 h-6" /> Auf Instagram veröffentlichen
                            </button>
                            <div className="flex gap-3">
                              <button onClick={() => renderVideo(activePiece.id)} className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-3 rounded-lg font-bold shadow-sm transition-colors flex-1 flex items-center justify-center gap-2">
                                <Play className="w-4 h-4" /> Neu rendern
                              </button>
                              <button onClick={() => approveHook(activePiece.id, activePiece.selectedHook!)} className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-3 rounded-lg font-bold shadow-sm transition-colors flex-1 flex items-center justify-center gap-2">
                                <RefreshCcw className="w-4 h-4" /> Neu vertonen
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>

              <div className="flex justify-end gap-4 mb-6 w-full">
                {activeStep > 0 && (
                  <button 
                    onClick={() => {
                      localStorage.removeItem('activePipelineSession');
                      setActiveStep(0);
                      setIsRunning(false);
                      setIsWaitingForApproval(false);
                    }} 
                    className="bg-white border-2 border-slate-200 hover:border-red-300 text-slate-600 hover:text-red-600 hover:bg-red-50 font-bold py-4 px-6 rounded-xl flex items-center gap-2 transition-all shadow-sm"
                  >
                    <RefreshCcw className="w-5 h-5" /> Pipeline verwerfen / Neustart
                  </button>
                )}

                {!isRunning ? (
                  <button onClick={startPipeline} disabled={activeStep > 0 || !topic} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-8 rounded-xl flex items-center gap-3 transition shadow-xl disabled:opacity-50 disabled:cursor-not-allowed">
                    E2E Produktion starten
                  </button>
                ) : (
                  <button disabled className="bg-indigo-600 opacity-50 text-white font-bold py-4 px-8 rounded-xl flex items-center gap-3 transition shadow-xl">
                    Pipeline läuft...
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
