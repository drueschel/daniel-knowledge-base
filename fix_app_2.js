const fs = require('fs');
let code = fs.readFileSync('agentic-cockpit/src/App.tsx', 'utf8');

// 1. Fix the Zeus initialization bug by moving activePiece checks down
const oldDirectorLogic = `
                  {(() => {
                    const activePiece = contentPieces.find(p => p.id === localStorage.getItem('activePipelineSession'));
                    
                    if (activeStep === 0) return <div className="text-slate-500">Gebe oben dein Thema ein und klicke auf "{isAutopilot ? 'E2E Produktion starten' : 'Phase 1: Research starten'}".</div>;
                    if (!activePiece) return <div className="text-slate-500 animate-pulse">Initialisiere Pipeline (Zeus)...</div>;

                    if (activeStep === 1) return <div className="text-slate-500 animate-pulse">Prometheus forscht in der Knowledge Base...</div>;
                    if (activeStep === 2) return <div className="text-slate-500 animate-pulse">Athena entwirft Format & Strategie...</div>;
                    if (activeStep === 3) return <div className="text-slate-500 animate-pulse">Calliope schreibt das Drehbuch & Hooks...</div>;
                    if (activeStep === 4) return <div className="text-slate-500 animate-pulse">Themis prüft das Skript (QA)...</div>;
`;

const newDirectorLogic = `
                  {(() => {
                    if (activeStep === 0) return <div className="text-slate-500">Gebe oben dein Thema ein und klicke auf "{isAutopilot ? 'E2E Produktion starten' : 'Phase 1: Research starten'}".</div>;
                    
                    if (activeStep === 1) return <div className="text-blue-600 font-bold animate-pulse flex items-center gap-2"><div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div> Prometheus forscht in der Knowledge Base...</div>;
                    if (activeStep === 2) return <div className="text-purple-600 font-bold animate-pulse flex items-center gap-2"><div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div> Athena entwirft Format & Strategie...</div>;
                    if (activeStep === 3) return <div className="text-green-600 font-bold animate-pulse flex items-center gap-2"><div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div> Calliope schreibt das Drehbuch & Hooks...</div>;
                    if (activeStep === 4) return <div className="text-teal-600 font-bold animate-pulse flex items-center gap-2"><div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div> Themis prüft das Skript (QA)...</div>;

                    const activePiece = contentPieces.find(p => p.id === localStorage.getItem('activePipelineSession'));
                    if (!activePiece) return <div className="text-slate-500 animate-pulse">Synchronisiere Daten mit Hub...</div>;
`;
code = code.replace(oldDirectorLogic, newDirectorLogic);


fs.writeFileSync('agentic-cockpit/src/App.tsx', code);
