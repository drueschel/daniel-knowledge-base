const fs = require('fs');
let code = fs.readFileSync('agentic-cockpit/src/App.tsx', 'utf8');

const oldApprove = `  const approveHook = async (id: string, hookKey: string) => {
    setToast({ message: 'Voiceover wird generiert (Hephaistos arbeitet)...', type: 'info' });
    try {
      const resp = await fetch(\`http://localhost:4000/api/content/\${id}/approve\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedHook: hookKey })
      });
      
      const json = await resp.json();
      if (!resp.ok) throw new Error(json.error || 'Generierung fehlgeschlagen');
      
      setToast({ message: 'Voiceover erfolgreich generiert!', type: 'success' });
    } catch (e: any) {
      console.error(e);
      setToast({ message: \`Voiceover-Fehler: \${e.message}\`, type: 'error' });
    } finally {
      // Refresh
      const res = await fetch('http://localhost:4000/api/content');
      setContentPieces(await res.json());
    }
  };`;

const newApprove = `  const approveHook = async (id: string, hookKey: string) => {
    setToast({ message: 'Produktion gestartet (Hephaistos & HyperFrames arbeiten)...', type: 'info' });
    setIsRunning(true);
    setActiveStep(6);
    try {
      const resp = await fetch(\`http://localhost:4000/api/content/\${id}/approve\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedHook: hookKey })
      });
      
      const json = await resp.json();
      if (!resp.ok) throw new Error(json.error || 'Generierung fehlgeschlagen');
      
      setToast({ message: 'Video erfolgreich fertiggestellt!', type: 'success' });
      setActiveStep(7);
      setIsRunning(false);
    } catch (e: any) {
      console.error(e);
      setToast({ message: \`Produktions-Fehler: \${e.message}\`, type: 'error' });
      setIsRunning(false);
    } finally {
      // Refresh
      const res = await fetch('http://localhost:4000/api/content');
      setContentPieces(await res.json());
    }
  };`;

code = code.replace(oldApprove, newApprove);

// We also need to add rendering for activeStep === 6 and 7 in the Director Workspace
const oldStep5 = `                      return (
                        <div className="animate-in fade-in slide-in-from-bottom-2">
                          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl mb-4 text-emerald-700">`;

const newStep5 = `                      return (
                        <div className="animate-in fade-in slide-in-from-bottom-2">
                          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl mb-4 text-emerald-700">`;

const oldStepRender = `                    if (activeStep === 5) {
                      return (`;

const newStepRender = `                    if (activeStep === 6) return <div className="text-orange-600 font-bold animate-pulse flex items-center gap-2"><div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div> Hephaistos (Voiceover) & HyperFrames (Rendern) laufen... (das kann ca. 2-3 Minuten dauern)</div>;
                    
                    if (activeStep === 7) return (
                      <div className="animate-in fade-in">
                        <div className="p-6 bg-indigo-50 border border-indigo-200 rounded-xl mb-4 text-indigo-900 shadow-sm text-center">
                          <h4 className="font-extrabold flex items-center justify-center gap-2 mb-2 text-xl"><CheckCircle2 className="w-6 h-6"/> E2E Produktion erfolgreich!</h4>
                          <p className="text-sm mb-6">Dein Video wurde vollständig gerendert und ist nun bereit zur Veröffentlichung.</p>
                          <button onClick={() => setActiveTab('hub')} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-xl transition shadow-xl">
                            Zum Content Hub wechseln
                          </button>
                        </div>
                      </div>
                    );

                    if (activeStep === 5) {
                      return (`;

code = code.replace(oldStepRender, newStepRender);

fs.writeFileSync('agentic-cockpit/src/App.tsx', code);
