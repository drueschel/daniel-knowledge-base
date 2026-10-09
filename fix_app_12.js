const fs = require('fs');
let code = fs.readFileSync('agentic-cockpit/src/App.tsx', 'utf8');

// Replace the entire checkPipelineStatus function
const checkPipelineRegex = /const checkPipelineStatus = async \([\s\S]*?\}\s*catch \(e\) \{\s*console\.error\(e\);\s*setTimeout\(\(\) => checkPipelineStatus\(sessionId\), 3000\);\s*\}\s*\};/g;

const newCheckPipeline = `const checkPipelineStatus = async (sessionId: string) => {
    try {
      const res = await fetch(\`http://localhost:4000/api/studio/session/\${sessionId}\`);
      const state = await res.json();
      if (!state || Object.keys(state).length === 0) {
        setIsRunning(false);
        localStorage.removeItem('activePipelineSession');
        setActiveStep(0);
        showToast('Pipeline-Session abgelaufen oder ungültig.', 'error');
        return;
      }
      
      if (state.status === 'completed' || state.status === 'production') {
        setActiveStep(7);
        setIsRunning(false);
        localStorage.removeItem('activePipelineSession');
        showToast('Pipeline abgeschlossen. Video ist im Content Hub!', 'success');
        return;
      }

      if (['voiceover', 'visuals', 'render'].includes(state.status)) {
        setActiveStep(6);
        setIsRunning(true);
        setTimeout(() => checkPipelineStatus(sessionId), 3000);
        return;
      }
      
      if (state.status === 'review') {
        setActiveStep(5);
        setIsRunning(false);
        return;
      }
      
      if (state.qa) { setActiveStep(5); setIsRunning(false); } 
      else if (state.script) { setActiveStep(4); setIsRunning(false); } 
      else if (state.strategy) { setActiveStep(3); setIsRunning(false); } 
      else if (state.research) { setActiveStep(2); setIsRunning(false); } 
      else { setActiveStep(1); }
      
      if (state.status !== 'error') {
         setTimeout(() => checkPipelineStatus(sessionId), 3000);
      } else {
         setIsRunning(false);
         localStorage.removeItem('activePipelineSession');
         showToast('Pipeline-Absturz. Bitte Logs prüfen!', 'error');
      }
    } catch (e) {
      console.error(e);
      setTimeout(() => checkPipelineStatus(sessionId), 3000);
    }
  };`;

code = code.replace(checkPipelineRegex, newCheckPipeline);

// Replace approveHook to trigger polling instead of blindly jumping to success
const approveRegex = /const approveHook = async \([\s\S]*?setContentPieces\(await res\.json\(\)\);\s*\}\s*\};/g;

const newApprove = `const approveHook = async (id: string, hookKey: string) => {
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
      
      checkPipelineStatus(id);
    } catch (e: any) {
      console.error(e);
      setToast({ message: \`Produktions-Fehler: \${e.message}\`, type: 'error' });
      setIsRunning(false);
    } finally {
      const res = await fetch('http://localhost:4000/api/content');
      setContentPieces(await res.json());
    }
  };`;

code = code.replace(approveRegex, newApprove);

fs.writeFileSync('agentic-cockpit/src/App.tsx', code);
