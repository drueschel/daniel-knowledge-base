            <div className="grid grid-cols-1 gap-6">
              {contentPieces.filter(p => p.status === 'completed' || p.status === 'production').length === 0 ? (
                <div className="text-center p-12 bg-slate-100/50 rounded-2xl border border-slate-200">
                  <Database className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-500 text-lg">Noch keine fertigen Content-Pieces vorhanden.</p>
                  <p className="text-slate-500 text-sm mt-2">Gehe ins Studio (Director Workspace), um deinen Content zu produzieren.</p>
                </div>
              ) : (
                contentPieces.filter(p => p.status === 'completed' || p.status === 'production').map(piece => (
                  <div key={piece.id} className="bg-slate-100 rounded-2xl border border-slate-200 p-6 shadow-xl relative overflow-hidden">
                    {/* Actions & Status Badge */}
                    <div className="absolute top-6 right-6 flex items-center gap-3">
                      <button onClick={() => deleteContent(piece.id)} className="text-slate-400 hover:text-red-500 transition-colors bg-white p-2 rounded-full shadow-sm hover:shadow-md border border-slate-200" title="Eintrag löschen">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> ABGESCHLOSSEN
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mb-4 pr-32">
                      <FileText className="w-6 h-6 text-indigo-600 shrink-0" />
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
                            <p className="text-xs text-emerald-600">Motion Graphics & Voiceover</p>
                          </div>
                        </div>
                        <div className="rounded-lg overflow-hidden border-2 border-emerald-100 shadow-sm flex justify-center bg-black">
                          <video 
                            controls 
                            className="max-h-[500px] w-full object-contain" 
                            src={`${piece.videoUrl.startsWith('http') ? piece.videoUrl : \`http://localhost:4000\${piece.videoUrl}\`}?t=\${new Date(piece.updatedAt).getTime()}`} 
                            key={piece.videoUrl + piece.updatedAt}
                          ></video>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <h4 className="text-slate-500 font-bold mb-3 uppercase tracking-wider text-xs flex items-center gap-2">
                          <Activity className="w-4 h-4 text-emerald-500" /> Ausgewählter Hook
                        </h4>
                        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
                          <p className="text-slate-900 text-sm leading-relaxed">{piece.selectedHook ? (piece.qaData?.final_script?.[piece.selectedHook] || piece.scriptData?.[piece.selectedHook]) : 'Kein Hook ausgewählt.'}</p>
                        </div>
                      </div>

                      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <h4 className="text-slate-500 font-bold mb-3 uppercase tracking-wider text-xs flex items-center gap-2">
                          <BrainCircuit className="w-4 h-4 text-pink-500" /> Skript Body
                        </h4>
                        <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">{piece.qaData?.final_script?.body || piece.scriptData?.body}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-4 text-xs text-slate-400 font-medium border-t border-slate-200 pt-4">
                      <span>Erstellt: {new Date(piece.createdAt).toLocaleString()}</span>
                      <span>Format: {piece.format}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
