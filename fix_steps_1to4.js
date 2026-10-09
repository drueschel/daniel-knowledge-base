const fs = require('fs');
let code = fs.readFileSync('agentic-cockpit/src/App.tsx', 'utf8');

const oldDirectorRender = `                    if (activeStep === 1) return <div className="text-slate-500 animate-pulse">Prometheus forscht in der Knowledge Base...</div>;
                    if (activeStep === 2) return <div className="text-slate-500 animate-pulse">Athena entwirft Format & Strategie...</div>;
                    if (activeStep === 3) return <div className="text-slate-500 animate-pulse">Calliope schreibt das Drehbuch & Hooks...</div>;
                    if (activeStep === 4) return <div className="text-slate-500 animate-pulse">Themis prüft das Skript (QA)...</div>;`;

const newDirectorRender = `                    if (activeStep === 1) return <div className="text-blue-600 font-bold animate-pulse flex items-center gap-2"><div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div> Prometheus forscht in der Knowledge Base...</div>;
                    
                    if (activeStep === 2 && !isRunning && !isAutopilot) return (
                      <div className="animate-in fade-in">
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-4 text-blue-800">
                          <h4 className="font-bold flex items-center gap-2 mb-2"><CheckCircle2 className="w-5 h-5"/> Phase 1: Research (Prometheus) abgeschlossen.</h4>
                          <p className="text-sm line-clamp-3 mb-2">{activePiece?.researchData?.core_pain || "Daten geladen..."}</p>
                          <button onClick={() => nextStepDirector('strategy', 3, 'Athena (Strategie)')} className="mt-2 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-6 rounded-lg transition shadow-md">
                            Review OK – Weiter: Athena starten
                          </button>
                        </div>
                      </div>
                    );

                    if (activeStep === 2) return <div className="text-purple-600 font-bold animate-pulse flex items-center gap-2"><div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div> Athena entwirft Format & Strategie...</div>;
                    
                    if (activeStep === 3 && !isRunning && !isAutopilot) return (
                      <div className="animate-in fade-in">
                        <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl mb-4 text-purple-800">
                          <h4 className="font-bold flex items-center gap-2 mb-2"><CheckCircle2 className="w-5 h-5"/> Phase 2: Strategie (Athena) abgeschlossen.</h4>
                          <p className="text-sm line-clamp-3 mb-2">Format: {activePiece?.strategyData?.format_type || "Strategie definiert..."}</p>
                          <button onClick={() => nextStepDirector('creative', 4, 'Calliope (Script)')} className="mt-2 bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded-lg transition shadow-md">
                            Review OK – Weiter: Calliope starten
                          </button>
                        </div>
                      </div>
                    );

                    if (activeStep === 3) return <div className="text-green-600 font-bold animate-pulse flex items-center gap-2"><div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div> Calliope schreibt das Drehbuch & Hooks...</div>;
                    
                    if (activeStep === 4 && !isRunning && !isAutopilot) return (
                      <div className="animate-in fade-in">
                        <div className="p-4 bg-green-50 border border-green-200 rounded-xl mb-4 text-green-800">
                          <h4 className="font-bold flex items-center gap-2 mb-2"><CheckCircle2 className="w-5 h-5"/> Phase 3: Drehbuch (Calliope) abgeschlossen.</h4>
                          <p className="text-sm line-clamp-3 mb-2">{activePiece?.scriptData?.body || "Skript generiert..."}</p>
                          <button onClick={() => nextStepDirector('qa', 5, 'Themis (QA)')} className="mt-2 bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-6 rounded-lg transition shadow-md">
                            Review OK – Weiter: Themis (QA) starten
                          </button>
                        </div>
                      </div>
                    );

                    if (activeStep === 4) return <div className="text-teal-600 font-bold animate-pulse flex items-center gap-2"><div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div> Themis prüft das Skript (QA)...</div>;`;

code = code.replace(oldDirectorRender, newDirectorRender);

// Also we need to remove the @ts-ignore from nextStepDirector because we're using it now!
code = code.replace(/\/\/ @ts-ignore\n  const nextStepDirector = /g, "const nextStepDirector = ");

fs.writeFileSync('agentic-cockpit/src/App.tsx', code);
