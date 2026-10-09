            <div className="grid grid-cols-1 gap-6">
              {contentPieces.length === 0 ? (
                <div className="text-center p-12 bg-slate-100/50 rounded-2xl border border-slate-200">
                  <Database className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-500 text-lg">Noch keine Content-Pieces vorhanden.</p>
                  <p className="text-slate-500 text-sm mt-2">Gehe ins Reel-Studio, um dein erstes Skript zu generieren.</p>
                </div>
              ) : (
                contentPieces.map(piece => (
                  <div key={piece.id} className="bg-slate-100 rounded-2xl border border-slate-200 p-6 shadow-xl relative overflow-hidden">
                    {/* Actions & Status Badge */}
                    <div className="absolute top-6 right-6 flex items-center gap-3">
                      {(piece.status === 'review' || piece.status === 'production') && (
                        <button onClick={async () => {
                          showToast('Skript wird neu generiert...', 'success');
                          await fetch(`http://localhost:4000/api/studio/pipeline/regenerate-script/${piece.id}`, { method: 'POST' });
                          setActiveTab('studio');
                          setIsRunning(true);
                          setActiveStep(3);
                          localStorage.setItem('activePipelineSession', piece.id);
                          checkPipelineStatus(piece.id);
                        }} className="text-indigo-500 hover:text-indigo-600 transition-colors bg-indigo-50 p-2 rounded-full shadow-sm hover:shadow-md border border-indigo-100 flex items-center gap-1" title="Skript neu generieren (Calliope & Themis)">
                          <RefreshCcw className="w-4 h-4" />
                          <span className="text-xs font-bold pr-1">Regenerate</span>
                        </button>
                      )}
                      {piece.status === 'error' && (
                        <button onClick={async () => {
                          showToast('Pipeline wird fortgesetzt...', 'info');
                          if (piece.selectedHook) {
                             // Retry Phase 2 (Production)
                             if (piece.audioUrl) {
                                await renderVideo(piece.id);
                             } else {
                                await approveHook(piece.id, piece.selectedHook);
                             }
                          } else {
                             // Retry Phase 1 (Scripting)
                             resumePipeline(piece.id);
                          }
                        }} className="text-red-500 hover:text-red-600 transition-colors bg-red-50 p-2 rounded-full shadow-sm hover:shadow-md border border-red-100 flex items-center gap-1" title="Fehlerbehebung / Retry">
                          <RefreshCcw className="w-4 h-4" />
                          <span className="text-xs font-bold pr-1">Retry</span>
                        </button>
                      )}
                      <button onClick={() => deleteContent(piece.id)} className="text-slate-400 hover:text-red-500 transition-colors bg-white p-2 rounded-full shadow-sm hover:shadow-md border border-slate-200" title="Eintrag löschen">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                        piece.status === 'review' ? 'bg-amber-100 text-amber-700 border border-amber-200 shadow-sm' : 
                        piece.status === 'voiceover' ? 'bg-blue-100 text-blue-700 border border-blue-200 shadow-sm' : 
                        piece.status === 'audio_ready' ? 'bg-teal-100 text-teal-700 border border-teal-200 shadow-sm' : 
                        piece.status === 'rendering' ? 'bg-purple-100 text-purple-700 border border-purple-200 shadow-sm' : 
                        piece.status === 'completed' || piece.status === 'production' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm' : 
                        piece.status === 'scripting' ? 'bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-sm' :
                        piece.status === 'error' ? 'bg-red-100 text-red-700 border border-red-200 shadow-sm' :
                        'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {piece.status === 'review' ? '⏳ WARTET AUF FREIGABE' : 
                         piece.status === 'voiceover' ? '🎙️ GENERIERE AUDIO' : 
                         piece.status === 'audio_ready' ? '🎵 AUDIO BEREIT' : 
                         piece.status === 'rendering' ? '🎬 RENDERE VIDEO' : 
                         piece.status === 'completed' || piece.status === 'production' ? '✅ ABGESCHLOSSEN' : 
                         piece.status === 'scripting' ? '✍️ IN ARBEIT' : 
                         piece.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                      <FileText className="w-6 h-6 text-indigo-600" />
                      <h3 className="text-xl font-bold text-slate-900">{piece.topic}</h3>
                    </div>

                    {piece.videoUrl && (
                      <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center">
                            <span className="text-xl">🎬</span>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-emerald-800">Finales Video (Maya & HyperFrames)</p>
                            <p className="text-xs text-emerald-600">Pexels + Remotion</p>
                          </div>
                        </div>
                        <div className="rounded-lg overflow-hidden border-2 border-emerald-100 shadow-sm flex justify-center bg-black">
                          <video 
                            controls 
                            className="h-[400px] object-cover" 
                            src={`${piece.videoUrl.startsWith('http') ? piece.videoUrl : `http://localhost:4000${piece.videoUrl}`}?t=${new Date(piece.updatedAt).getTime()}`} 
                            key={piece.videoUrl + piece.updatedAt}
                            poster="/avatars/maya.svg"
                          ></video>
                        </div>
                      </div>
                    )}
                    
                    {piece.audioUrl && !piece.videoUrl && (
                      <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center">
                              <span className="text-xl">🎙️</span>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-emerald-800">Voiceover Generiert (Hephaistos)</p>
                              <p className="text-xs text-emerald-600">ElevenLabs API</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {piece.selectedHook && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (piece.status !== 'rendering' && piece.status !== 'voiceover') {
                                    approveHook(piece.id, piece.selectedHook!);
                                  }
                                }}
                                disabled={piece.status === 'rendering' || piece.status === 'voiceover'}
                                className={`text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors font-bold shadow-sm ${piece.status === 'rendering' || piece.status === 'voiceover' ? 'opacity-50 cursor-not-allowed bg-slate-100 text-slate-400' : 'text-emerald-700 hover:text-emerald-900 bg-emerald-100 hover:bg-emerald-200'}`}
                              >
                                <RefreshCcw className="w-3 h-3" />
                                Neu vertonen
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (piece.status === 'audio_ready' || piece.status === 'review') { // Added review fallback just in case
                                  renderVideo(piece.id);
                                }
                              }}
                              disabled={piece.status === 'rendering'}
                              className={`text-xs flex items-center gap-1 px-4 py-1.5 rounded-lg transition-colors font-bold shadow-sm ${piece.status === 'rendering' ? 'bg-indigo-300 text-white cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                            >
                              <Play className="w-3 h-3" />
                              {piece.status === 'rendering' ? 'Rendert Video...' : 'Video Rendern'}
                            </button>
                          </div>
                        </div>
                        <audio controls className="w-full mt-2 h-10" src={`${piece.audioUrl}?t=${new Date(piece.updatedAt).getTime()}`} key={piece.audioUrl + piece.updatedAt}></audio>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                      <div>
                        <h4 className="text-slate-500 font-bold mb-3 uppercase tracking-wider text-xs flex items-center gap-2">
                          <Wand2 className="w-4 h-4 text-indigo-400" /> Hooks (Wähle einen aus)
                        </h4>
                        <div className="space-y-3">
                          {piece.status === 'error' ? (
                            <div className="p-6 rounded-xl border-2 border-red-100 bg-red-50/30 flex flex-col items-center justify-center h-40 text-center">
                              <p className="text-red-600 text-sm font-bold mb-1">Pipeline-Absturz</p>
                              <p className="text-red-500 text-xs mb-3">Ein Fehler ist aufgetreten.</p>
                              <button onClick={() => resumePipeline(piece.id)} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-red-700 transition-colors flex items-center gap-2">
                                <Play className="w-4 h-4" />
                                Fortsetzen
                              </button>
                            </div>
                          ) : piece.status === 'scripting' ? (
                            <div className="p-6 rounded-xl border-2 border-indigo-100 bg-indigo-50/30 flex flex-col items-center justify-center h-40">
                              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                              <p className="text-indigo-600 text-sm font-medium">KI schreibt Skript & Hooks...</p>
                            </div>
                          ) : (
                            ['hook_1', 'hook_2', 'hook_3'].map((h, i) => {
                              const hookText = piece.qaData?.final_script?.[h] || piece.scriptData?.[h];
                              const isSelected = piece.selectedHook === h;
                              if (!hookText) return null;
                              return (
                                <div 
                                  key={h} 
                                  onClick={() => piece.status === 'review' && approveHook(piece.id, h)}
                                  className={`p-5 rounded-xl border-2 transition cursor-pointer ${isSelected ? 'bg-indigo-50 border-indigo-500 shadow-md ring-2 ring-indigo-200 ring-offset-1' : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm'}`}
                                >
                                  <div className="flex justify-between items-center mb-2">
                                    <span className={`text-sm font-bold uppercase tracking-wider ${isSelected ? 'text-indigo-700' : 'text-slate-500'}`}>Option {i+1}</span>
                                    {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                                  </div>
                                  <p className="text-slate-900 text-sm leading-relaxed">{hookText}</p>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-slate-500 font-bold mb-3 uppercase tracking-wider text-xs flex items-center gap-2">
                          <FileText className="w-4 h-4 text-slate-400" /> Body
                        </h4>
                        {piece.status === 'error' ? (
                            <div className="p-6 rounded-xl border-2 border-red-100 bg-red-50/30 flex flex-col items-center justify-center h-40 text-center">
                              <p className="text-red-600 text-sm font-bold mb-1">Pipeline-Absturz</p>
                              <button onClick={() => resumePipeline(piece.id)} className="mt-2 px-4 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-red-700 transition-colors flex items-center gap-1 mx-auto">
                                <Play className="w-3 h-3" />
                                Fortsetzen
                              </button>
                            </div>
                        ) : piece.status === 'scripting' ? (
                            <div className="p-6 rounded-xl border-2 border-slate-100 bg-slate-50 flex flex-col items-center justify-center h-40">
                              <p className="text-slate-400 text-sm font-medium">Wartet auf Skript-Entwurf...</p>
                            </div>
                        ) : (
                          <div className="bg-white p-5 rounded-xl border border-slate-200 h-full shadow-sm">
                            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                              {piece.qaData?.final_script?.body || piece.scriptData?.body || 'Noch kein Body generiert.'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {piece.status === 'review' && !piece.selectedHook && (
                      <div className="mt-6 p-4 bg-amber-900/20 border border-amber-500/30 rounded-xl flex items-center justify-between">
                        <p className="text-amber-400 text-sm font-medium">Klicke oben auf einen Hook, um dieses Skript für die Video-Produktion freizugeben.</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
