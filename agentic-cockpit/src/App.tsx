import { useState, useEffect } from 'react';
import {  Bot, FileText, Play, CheckCircle2, Trash2, XCircle, Wand2, Users, BrainCircuit, Video, Database, Activity, X, LayoutGrid, List , RefreshCcw , Search, Zap } from 'lucide-react';

function LogsTab() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [filterAgent, setFilterAgent] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSession, setFilterSession] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = () => {
      fetch('http://localhost:4000/api/activity')
        .then(res => res.json())
        .then(data => { setLogs(data); setLoading(false); setLastUpdated(new Date()); })
        .catch(() => setLoading(false));
    };
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  
  const clearLogs = async () => {
    try {
      await fetch('http://localhost:4000/api/activity', { method: 'DELETE' });
      setLogs([]);
    } catch(e) {}
  };

  const friendlyAgentName = (id: string) => {
    const names: Record<string, string> = {
      data: 'Prometheus (Daten)',
      research: 'Prometheus (Alt)',
      strategy: 'Athena (Strategie)',
      mia: 'Athena (Alt)',
      creative: 'Calliope (Skript)',
      script: 'Calliope (Alt)',
      qa: 'Themis (Qualität)',
      production: 'Hephaistos (Video)',
      community: 'Aphrodite (Community)',
      human: 'Human (CEO)',
      orchestrator: 'Zeus (Orchestrator)',
      ingestion: 'Felix (Import)'
    };
    return names[id] || id;
  };

  const friendlySession = (sid: string) => {
    if (!sid) return '-';
    if (sid.startsWith('session_')) {
      const ts = parseInt(sid.split('_')[1]);
      if (!isNaN(ts)) {
        return `Run: ${new Date(ts).toLocaleTimeString('de-DE')}`;
      }
    }
    return sid;
  };
const agentIds = ['all', ...Array.from(new Set(logs.map((l: any) => l.agentId))).sort()];
  const sessionIds = ['all', ...Array.from(new Set(logs.filter((l: any) => l.sessionId).map((l: any) => l.sessionId)))];

  const filtered = logs.filter((l: any) => {
    if (filterAgent !== 'all' && l.agentId !== filterAgent) return false;
    if (filterStatus !== 'all' && l.status !== filterStatus) return false;
    if (filterSession !== 'all' && l.sessionId !== filterSession) return false;
    return true;
  });

  const stats = {
    total: logs.length,
    success: logs.filter((l: any) => l.status === 'success').length,
    error: logs.filter((l: any) => l.status === 'error').length,
    sessions: new Set(logs.filter((l: any) => l.sessionId).map((l: any) => l.sessionId)).size,
  };

  const statusColor = (status: string) => {
    if (status === 'success') return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (status === 'error') return 'text-red-500 bg-red-50 border-red-200';
    return 'text-slate-500 bg-slate-50 border-slate-200';
  };

  const agentColor = (agentId: string) => {
    const map: Record<string, string> = {
      data: 'bg-blue-100 text-blue-700', strategy: 'bg-purple-100 text-purple-700',
      creative: 'bg-pink-100 text-pink-700', qa: 'bg-amber-100 text-amber-700',
      production: 'bg-orange-100 text-orange-700', community: 'bg-emerald-100 text-emerald-700',
      orchestrator: 'bg-yellow-100 text-yellow-700',
    };
    return map[agentId] || 'bg-slate-100 text-slate-600';
  };

  return (
    <div className="px-8 md:px-12 pt-10 pb-32 max-w-7xl mx-auto w-full">
      <header className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold mb-2 text-slate-900">Aktivitäts-Log</h2>
          <p className="text-slate-500">
            Echtzeit-Protokoll aller Agenten-Aktionen · Auto-Refresh alle 5s
            {lastUpdated && <span className="ml-2 text-xs text-slate-400">· Zuletzt: {lastUpdated.toLocaleTimeString('de-DE')}</span>}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={clearLogs} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 text-xs font-bold transition">
            <Trash2 className="w-3 h-3" /> Logs leeren
          </button>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-600 font-medium">Live</span>
          </div>
        </div>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Gesamt', value: stats.total, color: 'text-slate-700' },
          { label: 'Erfolgreich', value: stats.success, color: 'text-emerald-600' },
          { label: 'Fehler', value: stats.error, color: 'text-red-500' },
          { label: 'Sessions', value: stats.sessions, color: 'text-indigo-600' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl px-5 py-4 shadow-sm">
            <p className="text-xs text-slate-400 uppercase tracking-wide font-bold mb-1">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 mb-6 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Agent</label>
          <select value={filterAgent} onChange={e => setFilterAgent(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:border-indigo-400">
            {agentIds.map(a => <option key={a} value={a}>{a === 'all' ? 'Alle Agenten' : friendlyAgentName(a)}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Status</label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:border-indigo-400">
            <option value="all">Alle Status</option>
            <option value="success">✅ Erfolg</option>
            <option value="error">❌ Fehler</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Session</label>
          <select value={filterSession} onChange={e => setFilterSession(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:border-indigo-400">
            {sessionIds.map(s => <option key={s} value={s}>{s === 'all' ? 'Alle Durchläufe' : friendlySession(s)}</option>)}
          </select>
        </div>
        {(filterAgent !== 'all' || filterStatus !== 'all' || filterSession !== 'all') && (
          <button onClick={() => { setFilterAgent('all'); setFilterStatus('all'); setFilterSession('all'); }}
            className="ml-auto text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 transition">
            <X className="w-3 h-3" /> Filter zurücksetzen
          </button>
        )}
      </div>

      {/* Log Entries */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">Lade Logs…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
          <Activity className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>Keine Einträge für diesen Filter.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((log: any, i: number) => {
            const rowId = log.id || String(i);
            const isExpanded = expandedId === rowId;
            return (
              <div key={rowId}
                className={`bg-white rounded-xl border shadow-sm transition-all cursor-pointer select-none ${log.status === 'error' ? 'border-red-200' : 'border-slate-200'} ${isExpanded ? 'ring-2 ring-indigo-200' : 'hover:border-slate-300'}`}
                onClick={() => setExpandedId(isExpanded ? null : rowId)}>
                <div className="px-5 py-3 flex items-center gap-4">
                  <div className={`px-2 py-0.5 rounded-full text-xs font-bold border flex-shrink-0 ${statusColor(log.status)}`}>
                    {log.status === 'success' ? '✓' : '✗'}
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-xs font-bold flex-shrink-0 ${agentColor(log.agentId)}`}>
                    {friendlyAgentName(log.agentId)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{log.action}</p>
                    {!isExpanded && log.details && (
                      <p className="text-xs text-slate-400 truncate">{log.details}</p>
                    )}
                  </div>
                  {log.model && (
                    <span className="font-mono text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded flex-shrink-0 hidden sm:block">
                      {log.model}
                    </span>
                  )}
                  <span className="text-xs text-slate-400 flex-shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString('de-DE')}
                  </span>
                </div>
                {isExpanded && (
                  <div className="px-5 pb-4 border-t border-slate-100 pt-3 space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {log.sessionId && (
                        <div>
                          <p className="font-bold text-slate-400 uppercase tracking-wide mb-1">Durchlauf</p>
                          <p className="font-medium text-slate-600 bg-slate-50 rounded px-2 py-1">{friendlySession(log.sessionId)}</p>
                        </div>
                      )}
                      {log.model && (
                        <div>
                          <p className="font-bold text-slate-400 uppercase tracking-wide mb-1">Modell</p>
                          <p className="font-mono text-slate-600 bg-slate-50 rounded px-2 py-1">{log.model}</p>
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-slate-400 uppercase tracking-wide mb-1">Zeitstempel</p>
                        <p className="font-mono text-slate-600 bg-slate-50 rounded px-2 py-1">
                          {new Date(log.timestamp).toLocaleString('de-DE')}
                        </p>
                      </div>
                    </div>
                    {log.details && (
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Details</p>
                        <pre className={`text-xs rounded px-3 py-2 whitespace-pre-wrap break-all font-mono leading-relaxed ${log.status === 'error' ? 'bg-red-50 text-red-700' : 'bg-slate-50 text-slate-600'}`}>
                          {log.details}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [employees, setEmployees] = useState<any[]>([]);
    const [teamViewMode, setTeamViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'team' | 'studio' | 'import' | 'hub' | 'logs'>(() => (localStorage.getItem('activeTab') as any) || 'team');
  useEffect(() => { localStorage.setItem('activeTab', activeTab); }, [activeTab]);

  // Clean up dirty URLs
  useEffect(() => {
    if (window.location.pathname !== '/') {
      window.history.replaceState(null, '', '/');
    }
  }, []);

  const [activeStep, setActiveStep] = useState(0);
  
  const [isRunning, setIsRunning] = useState(false);
  const [isAutopilot, setIsAutopilot] = useState(false);
  
  
  const generateVisuals = async (id: string) => {
    try {
      showToast('Generiere Storyboard (Maya)...', 'info');
      await fetch(`http://localhost:4000/api/content/${id}/visuals`, { method: 'POST' });
    } catch (e) {
      showToast('Fehler bei Maya.', 'error');
    }
  };

  const renderVideo = async (id: string) => {
    try {
      showToast('Rendering gestartet (Maya & HyperFrames)...', 'info');
      setActiveStep(7);
      await fetch(`http://localhost:4000/api/content/${id}/render`, { method: 'POST' });
    } catch (e) {
      showToast('Fehler beim Rendern.', 'error');
    }
  };
  // @ts-ignore
  const [isWaitingForApproval, setIsWaitingForApproval] = useState(false);
  const [topic, setTopic] = useState(() => localStorage.getItem('studioTopic') || '');
  const [researchScope, setResearchScope] = useState<'kb_only' | 'kb_and_web' | 'web_only'>(() => (localStorage.getItem('studioScope') as any) || 'kb_and_web');
  const [moduleFilter, setModuleFilter] = useState(() => localStorage.getItem('studioFilter') || 'all');
  
  useEffect(() => { localStorage.setItem('studioTopic', topic); }, [topic]);
  useEffect(() => { localStorage.setItem('studioScope', researchScope); }, [researchScope]);
  useEffect(() => { localStorage.setItem('studioFilter', moduleFilter); }, [moduleFilter]);
  
  const [ytUrl, setYtUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importStep, setImportStep] = useState(0);

  // New Training / HR State
  const [trainingAgent, setTrainingAgent] = useState<any>(null);
  const [feedbackInput, setFeedbackInput] = useState('');
  const [isTraining, setIsTraining] = useState(false);

  
  useEffect(() => {
    fetch('http://localhost:4000/api/employees')
      .then(res => res.json())
      .then(data => setEmployees(data))
      .catch(console.error);
      
    fetch('http://localhost:4000/api/knowledge/structure')
      .then(res => res.json())
      .then(data => setKbStructure(data))
      .catch(console.error);
  }, []);

  // Content Hub State
  

  const [contentPieces, setContentPieces] = useState<any[]>([]);
  const [kbStructure, setKbStructure] = useState<any[]>([]);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };



  // Fetch content pieces on tab switch & poll if scripting
  useEffect(() => {
    let interval: any;
    const fetchContent = () => {
      fetch('http://localhost:4000/api/content')
        .then(res => res.json())
        .then(data => setContentPieces(data))
        .catch(console.error);
    };
    
    if (activeTab === 'hub' || activeTab === 'studio') {
      fetchContent();
      interval = setInterval(fetchContent, 3000);
    }
    return () => clearInterval(interval);
  }, [activeTab]);

  const deleteContent = (id: string) => {
    setConfirmDeleteId(id);
  };

  const executeDeleteContent = async (id: string) => {
    setConfirmDeleteId(null);
    try {
      await fetch(`http://localhost:4000/api/content/${id}`, { method: 'DELETE' });
      const res = await fetch('http://localhost:4000/api/content');
      setContentPieces(await res.json());
      showToast('Eintrag gelöscht', 'success');
    } catch (e) {
      console.error(e);
    }
  };

  const rerenderContent = async (id: string) => {
    showToast('Neu-Rendern gestartet (Remotion)...', 'info');
    try {
      await fetch(`http://localhost:4000/api/content/${id}/render`, { method: 'POST' });
    } catch (e) {
      console.error(e);
      showToast('Fehler beim Neu-Rendern', 'error');
    }
  };

  // @ts-ignore
  const resumePipeline = async (id: string) => {
    const piece = contentPieces.find(p => p.id === id);
    if (!piece) return;
    
    setToast({ message: 'Pipeline wird fortgesetzt...', type: 'info' });
    setActiveTab('studio');
    setIsRunning(true);
    
    // Determine the step to resume from visually
    if (piece.scriptData) setActiveStep(6);
    else if (piece.strategyData) setActiveStep(3);
    else if (piece.researchData) setActiveStep(2);
    else setActiveStep(1);
    
    localStorage.setItem('activePipelineSession', id);
    
    try {
      await fetch('http://localhost:4000/api/studio/pipeline/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sessionId: id, 
          prompt: piece.topic,
          researchScope: 'kb_and_web',
          moduleFilter: 'all'
        })
      });
      checkPipelineStatus(id);
    } catch (e) {
      console.error(e);
      setToast({ message: 'Fehler beim Fortsetzen', type: 'error' });
    }
  };

  const approveHook = async (id: string, hookKey: string) => {
    showToast('Produktion gestartet (Hephaistos & HyperFrames arbeiten)...', 'info');
    setIsRunning(true);
    setActiveStep(6);
    try {
      const resp = await fetch(`http://localhost:4000/api/content/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedHook: hookKey })
      });
      
      const json = await resp.json();
      if (!resp.ok) throw new Error(json.error || 'Generierung fehlgeschlagen');
      
      checkPipelineStatus(id);
    } catch (e: any) {
      console.error(e);
      showToast(`Produktions-Fehler: ${e.message}`, 'error');
      setIsRunning(false);
    } finally {
      const res = await fetch('http://localhost:4000/api/content');
      setContentPieces(await res.json());
    }
  };

  
  const updateAiModel = async (newModel: string) => {
    if (!trainingAgent) return;
    try {
      const res = await fetch(`http://localhost:4000/api/employees/${trainingAgent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aiModel: newModel })
      });
      const updatedEmp = await res.json();
      setTrainingAgent(updatedEmp);
      setEmployees(employees.map(e => e.id === updatedEmp.id ? updatedEmp : e));
    } catch (e) {
      console.error("Failed to update AI model", e);
    }
  };

  const submitFeedback = async () => {
    if (!trainingAgent || !feedbackInput.trim()) return;
    setIsTraining(true);
    try {
      const res = await fetch(`http://localhost:4000/api/employees/${trainingAgent.id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: feedbackInput })
      });
      const updatedEmployee = await res.json();
      setEmployees(prev => prev.map(e => e.id === updatedEmployee.id ? updatedEmployee : e));
      setTrainingAgent(updatedEmployee);
      setFeedbackInput('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsTraining(false);
    }
  };

  const saveEmployeeProfile = async (id: string, updates: any) => {
    try {
      const res = await fetch(`http://localhost:4000/api/employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const updatedEmployee = await res.json();
      setEmployees(prev => prev.map(e => e.id === updatedEmployee.id ? updatedEmployee : e));
      if (trainingAgent?.id === id) setTrainingAgent(updatedEmployee);
    } catch (e) {
      console.error(e);
    }
  };

  const [importResponse, setImportResponse] = useState<any>(null);

  const checkPipelineStatus = async (sessionId: string) => {
    if (localStorage.getItem('activePipelineSession') !== sessionId) {
      return; // Stop polling if user reset the pipeline or started a new one
    }
    try {
      const res = await fetch(`http://localhost:4000/api/studio/session/${sessionId}`);
      const state = await res.json();
      
      const contentRes = await fetch(`http://localhost:4000/api/content`);
      const allPieces = await contentRes.json();
      const pieceState = allPieces.find((p: any) => p.id === sessionId);
      
      if ((!state || Object.keys(state).length === 0) && (!pieceState || pieceState.status === 'error')) {
        setIsRunning(false);
        localStorage.removeItem('activePipelineSession');
        setActiveStep(0);
        showToast('Pipeline-Session abgelaufen oder ungültig.', 'error');
        return;
      }
      
      if (pieceState && pieceState.status !== 'error' && pieceState.status !== 'scripting' && pieceState.status !== 'idea') {
        if (pieceState.status === 'completed' || pieceState.status === 'production') {
          setActiveStep(7);
          setIsRunning(false);
          return;
        }
        if (['voiceover', 'audio_ready', 'visuals', 'visuals_ready', 'rendering'].includes(pieceState.status)) {
          setActiveStep(6);
          setIsRunning(true);
          setTimeout(() => checkPipelineStatus(sessionId), 3000);
          return;
        }
        if (pieceState.status === 'review') {
          setActiveStep(5);
          setIsRunning(false);
          return;
        }
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
      }
    } catch (e) {
      console.error(e);
      setTimeout(() => checkPipelineStatus(sessionId), 3000);
    }
  };


  useEffect(() => {
    const savedSession = localStorage.getItem('activePipelineSession');
    if (savedSession) {
      setIsRunning(true);
      checkPipelineStatus(savedSession);
    }
  }, []);

  const resetPipeline = () => {
    localStorage.removeItem('activePipelineSession');
    setActiveStep(0);
    setTopic('');
    setIsRunning(false);
  };
  

  const startPipeline = async () => {
    const sessionId = `session_${Date.now()}`;
    setIsRunning(true);
    setActiveStep(1);
    localStorage.setItem('activePipelineSession', sessionId);
    
    if (isAutopilot) {
      try {
        await fetch(`http://localhost:4000/api/studio/pipeline/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, prompt: topic, researchScope, moduleFilter })
        });
        checkPipelineStatus(sessionId);
      } catch (e) {
        showToast('Backend nicht erreichbar', 'error');
        setIsRunning(false);
      }
    } else {
      // Director Mode: Step-by-step
      try {
        await fetch(`http://localhost:4000/api/studio/data`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, prompt: topic, researchScope, moduleFilter })
        });
        setIsRunning(false);
        setActiveStep(2);
        showToast('Prometheus (Research) abgeschlossen.', 'success');
      } catch (e) {
        showToast('Backend nicht erreichbar', 'error');
        setIsRunning(false);
      }
    }
  };

  const nextStepDirector = async (endpoint: string, nextStep: number, agentName: string) => {
    const sessionId = localStorage.getItem('activePipelineSession');
    if (!sessionId) return;
    setIsRunning(true);
    try {
      await fetch(`http://localhost:4000/api/studio/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, prompt: topic, researchScope, moduleFilter })
      });
      setIsRunning(false);
      setActiveStep(nextStep);
      showToast(`${agentName} abgeschlossen.`, 'success');
    } catch (e) {
      showToast('Backend nicht erreichbar', 'error');
      setIsRunning(false);
    }
  };

  const startImport = async () => {
    if(!ytUrl) return;
    setIsImporting(true);
    setImportStep(1);
    setImportResponse(null);

    try {
      // Update step visual instantly to indicate backend processing
      const timer = setInterval(() => {
         setImportStep(s => s < 2 ? s + 1 : s);
      }, 1500);

      const response = await fetch("http://localhost:4000/api/ingest/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: ytUrl })
      });
      
      clearInterval(timer);
      
      if (response.ok) {
        const data = await response.json();
        setImportResponse(data);
        setImportStep(3);
      } else {
        showToast("Fehler beim Importieren!", "error");
        setImportStep(0);
      }
    } catch (e) {
      showToast("Backend nicht erreichbar! Läuft der Node-Server auf Port 4000?", "error");
      setImportStep(0);
    } finally {
      setTimeout(() => setIsImporting(false), 2000);
    }
  };

  // Filter studio agents (exclude Ingest & Analytics for the active render pipeline, include render step)
  const studioPipeline = [
    employees.find(e => e.id === 'data') || { name: 'Prometheus', avatar: '/avatars/prometheus.svg' },
    employees.find(e => e.id === 'strategy') || { name: 'Athena', avatar: '/avatars/athena.svg' },
    employees.find(e => e.id === 'creative') || { name: 'Calliope', avatar: '/avatars/calliope.svg' },
    employees.find(e => e.id === 'qa') || { name: 'Themis', avatar: '/avatars/themis.svg' },
    employees.find(e => e.id === 'production') || { name: 'Hephaistos', avatar: '/avatars/hephaistos.svg' },
    { id: 'render', name: 'HyperFrames', avatar: '🎬', role: 'System' },
    employees.find(e => e.id === 'community') || { name: 'Aphrodite', avatar: '/avatars/aphrodite.svg' }
  ];

  return (
    <div className="flex h-screen bg-white text-slate-900 overflow-hidden font-sans">
      {/* Sidebar */}
      <div className="w-72 bg-slate-50 border-r border-slate-200 flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Wand2 className="w-8 h-8 text-indigo-600" />
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              Creator CEO
            </h1>
          </div>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-bold ml-11">Dashboard</p>
        </div>
        
        <div className="px-4 space-y-2 mt-4">
          <button onClick={() => setActiveTab('team')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'team' ? 'bg-indigo-500/10 text-indigo-600' : 'text-slate-500 hover:bg-slate-100/50 hover:text-slate-900'}`}>
            <Users className="w-5 h-5" />
            <span className="font-medium">Mitarbeiter Portal ({employees.length})</span>
          </button>
          <button onClick={() => setActiveTab('hub')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'hub' ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-500 hover:bg-slate-100/50 hover:text-slate-900'}`}>
            <Database className="w-5 h-5" />
            <span className="font-medium">Content Hub</span>
          </button>
          <button onClick={() => setActiveTab('import')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'import' ? 'bg-red-500/10 text-red-400' : 'text-slate-500 hover:bg-slate-100/50 hover:text-slate-900'}`}>
            <Video className="w-5 h-5" />
            <span className="font-medium">Wissens-Import</span>
          </button>
          <button onClick={() => setActiveTab('studio')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'studio' ? 'bg-indigo-500/10 text-indigo-600' : 'text-slate-500 hover:bg-slate-100/50 hover:text-slate-900'}`}>
            <Play className="w-5 h-5" />
            <span className="font-medium">Reel-Studio E2E</span>
          </button>
          <button onClick={() => setActiveTab('logs')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'logs' ? 'bg-orange-500/10 text-orange-500' : 'text-slate-500 hover:bg-slate-100/50 hover:text-slate-900'}`}>
            <Activity className="w-5 h-5" />
            <span className="font-medium">Aktivitäts-Log</span>
          </button>
        </div>
        
        <div className="mt-auto p-4">
          <div className="bg-white border border-slate-200 p-4 rounded-xl mb-4">
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <Activity className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-bold uppercase">Feedback Loop</span>
            </div>
            <p className="text-xs text-slate-500">Oliver wartet auf neue IG Insights des letzten Uploads zur Optimierung der Hooks.</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'team' && (
          <div className="px-8 md:px-12 pt-10 pb-32 max-w-7xl mx-auto w-full">
            <header className="mb-10 flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-bold mb-2 text-slate-900">Dein E2E Agenten-Team</h2>
                <p className="text-slate-500 text-lg">9 Core-Rollen für den wasserdichten Content-Zyklus.</p>
              </div>
              <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button 
                  onClick={() => setTeamViewMode('grid')} 
                  className={`p-2 rounded-md transition-colors ${teamViewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setTeamViewMode('list')} 
                  className={`p-2 rounded-md transition-colors ${teamViewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </header>
            
            {trainingAgent ? (
              <div className="bg-slate-100 border border-slate-200 rounded-2xl p-6 mb-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl border ${trainingAgent.color}`}>{trainingAgent.avatar.startsWith("/") ? <img src={trainingAgent.avatar} className="w-full h-full object-cover rounded-xl" alt={trainingAgent.name} /> : trainingAgent.avatar}</div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 leading-tight">Personalakte: {trainingAgent.name}</h3>
                      <p className="text-sm text-slate-500">{trainingAgent.role} | Lvl {trainingAgent.level} | <select 
                        value={trainingAgent.aiModel || 'claude-sonnet-5-5'}
                        onChange={(e) => updateAiModel(e.target.value)}
                        className="font-mono text-xs bg-slate-200 px-1.5 py-0.5 rounded text-slate-600 border-none outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option value="claude-sonnet-5-5">claude-sonnet-5-5 (Creative/Smart)</option>
                        <option value="claude-sonnet-5">claude-sonnet-5 (Balanced)</option>
                        <option value="claude-haiku-4-5">claude-haiku-4-5 (Fast/Cheap)</option>
                      </select></p>
                    </div>
                  </div>
                  <button onClick={() => setTrainingAgent(null)} className="text-slate-500 hover:text-slate-900">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Left Column: Memory & Rules */}
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200">
                      <h4 className="text-sm font-bold text-indigo-600 mb-2">System Prompt</h4>
                      <textarea 
                        className="w-full bg-transparent text-sm text-slate-600 resize-none h-24 focus:outline-none"
                        value={trainingAgent.systemPrompt}
                        onChange={(e) => setTrainingAgent({...trainingAgent, systemPrompt: e.target.value})}
                        onBlur={() => saveEmployeeProfile(trainingAgent.id, { systemPrompt: trainingAgent.systemPrompt })}
                      />
                    </div>
                    
                    <div className="bg-white p-4 rounded-xl border border-slate-200">
                      <h4 className="text-sm font-bold text-red-400 mb-2">No-Go Liste</h4>
                      <ul className="list-disc pl-4 text-sm text-slate-600 space-y-1">
                        {trainingAgent.noGoList.map((item: string, i: number) => <li key={i}>{item}</li>)}
                        {trainingAgent.noGoList.length === 0 && <li className="text-slate-500 italic">Noch keine No-Gos</li>}
                      </ul>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200">
                      <h4 className="text-sm font-bold text-emerald-400 mb-2">Memory / Learnings</h4>
                      <ul className="list-disc pl-4 text-sm text-slate-600 space-y-1">
                        {trainingAgent.memory.map((item: string, i: number) => <li key={i}>{item}</li>)}
                        {trainingAgent.memory.length === 0 && <li className="text-slate-500 italic">Noch keine Learnings</li>}
                      </ul>
                    </div>
                  </div>

                  {/* Right Column: Training Input */}
                  <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-xl p-5 flex flex-col">
                    <h4 className="font-bold text-indigo-300 mb-2 flex items-center gap-2">
                      <BrainCircuit className="w-4 h-4" /> Feedback & Training
                    </h4>
                    <p className="text-xs text-indigo-200/70 mb-4">
                      Als CEO kannst du {trainingAgent.name} hier Feedback in natürlicher Sprache geben. Die KI wird das Feedback analysieren und als harte Regel in die No-Go Liste oder das Memory übernehmen.
                    </p>
                    <textarea 
                      placeholder="z.B. Die Hooks im letzten Video waren zu lang. Bitte Hooks künftig unter 15 Wörtern halten!"
                      className="w-full bg-white/50 border border-indigo-500/30 rounded-lg p-3 text-sm text-slate-900 focus:outline-none focus:border-indigo-400 flex-1 resize-none mb-4"
                      value={feedbackInput}
                      onChange={(e) => setFeedbackInput(e.target.value)}
                    />
                    <button 
                      onClick={submitFeedback}
                      disabled={isTraining || !feedbackInput.trim()}
                      className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-bold py-2 rounded-lg transition"
                    >
                      {isTraining ? 'Analysiert...' : 'Feedback verarbeiten'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {teamViewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {employees.map(emp => (
                      <div key={emp.id} className="bg-slate-100/50 border border-slate-200 rounded-2xl p-5 hover:bg-slate-100 transition shadow-xl flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border ${emp.color}`}>{emp.avatar.startsWith('/') ? <img src={emp.avatar} className="w-full h-full object-cover rounded-xl" alt={emp.name} /> : emp.avatar}</div>
                            <div>
                              <h3 className="text-lg font-bold text-slate-900 leading-tight">{emp.name}</h3>
                              <p className="text-xs text-slate-500">{emp.role}</p>
                            </div>
                          </div>
                        </div>
                        <p className="text-slate-600 text-xs mb-4 leading-relaxed flex-1">{emp.description}</p>
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {emp.traits.map((t: string) => <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200">{t}</span>)}
                        </div>
                        <div className="pt-3 border-t border-slate-200/50 flex justify-between items-center mt-auto">
                          <span className="text-xs font-bold text-slate-900">Lvl {emp.level}</span>
                          <button onClick={() => setTrainingAgent(emp)} className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-300 text-xs font-medium transition cursor-pointer">
                            <BrainCircuit className="w-3.5 h-3.5" /> Trainieren / Akte
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                          <th className="px-6 py-4 font-bold">Mitarbeiter</th>
                          <th className="px-6 py-4 font-bold">Rolle</th>
                          <th className="px-6 py-4 font-bold">Level</th>
                          <th className="px-6 py-4 font-bold text-right">Aktion</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {employees.map(emp => (
                          <tr key={emp.id} className="hover:bg-slate-50 transition group">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl border ${emp.color}`}>{emp.avatar.startsWith('/') ? <img src={emp.avatar} className="w-full h-full object-cover rounded-lg" alt={emp.name} /> : emp.avatar}</div>
                                <div>
                                  <div className="font-bold text-slate-900">{emp.name}</div>
                                  <div className="text-xs text-slate-500 max-w-xs truncate">{emp.description}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-medium text-slate-700">{emp.role}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded bg-indigo-50 text-indigo-600 border border-indigo-100">
                                Lvl {emp.level}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button onClick={() => setTrainingAgent(emp)} className="inline-flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 text-sm font-medium transition cursor-pointer bg-white border border-slate-200 hover:border-indigo-200 px-3 py-1.5 rounded-lg shadow-sm">
                                <BrainCircuit className="w-4 h-4" /> Akte öffnen
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* YOUTUBE IMPORT */}
        {activeTab === 'import' && (
          <div className="px-8 md:px-12 pt-10 pb-32 max-w-5xl mx-auto w-full">
            <header className="mb-10">
              <h2 className="text-3xl font-bold mb-2 text-slate-900">Knowledge Base Ingestion (Felix)</h2>
              <p className="text-slate-500 text-lg">YouTube-Videos analysieren und als Markdown in Obsidian speichern.</p>
            </header>
            
            <div className="bg-slate-100 rounded-2xl border border-slate-200 p-8 shadow-2xl mb-10">
              <div className="flex gap-4 items-end mb-8">
                  <input type="text" placeholder="https://youtube.com/watch?v=..." value={ytUrl} onChange={(e) => setYtUrl(e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl p-4 text-slate-900 font-medium focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition shadow-inner" />
                </div>
                <button onClick={startImport} disabled={isImporting || !ytUrl} className="bg-red-600 hover:bg-red-500 text-white font-bold py-4 px-8 rounded-xl flex items-center gap-2 disabled:opacity-50 transition transform hover:scale-105 active:scale-95 shadow-xl">
                  <Database className="w-5 h-5" /> Import
                </button>
              </div>

              {/* Status UI */}
              <div className="bg-white rounded-xl p-6 border border-slate-200/50 min-h-[200px]">
                {importStep === 0 && !importResponse && (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500">
                    <Bot className="w-12 h-12 mb-3 opacity-20" />
                    <p>Felix wartet auf einen Auftrag...</p>
                  </div>
                )}
                
                {importStep > 0 && (
                  <div className="space-y-4">
                    <div className={`flex items-center gap-3 transition-opacity ${importStep >= 1 ? 'opacity-100 text-blue-600' : 'opacity-30'}`}>
                      {importStep > 1 ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
                      <span>Sende URL an lokales Backend...</span>
                    </div>
                    <div className={`flex items-center gap-3 transition-opacity ${importStep >= 2 ? 'opacity-100 text-purple-600' : 'opacity-30'}`}>
                      {importStep > 2 ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : (importStep === 2 ? <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div> : <div className="w-5 h-5 rounded-full border-2 border-slate-200"></div>)}
                      <span>Agent Felix zieht Transkript und extrahiert Fakten...</span>
                    </div>
                    <div className={`flex items-center gap-3 transition-opacity ${importStep >= 3 ? 'opacity-100 text-emerald-400' : 'opacity-30'}`}>
                       {importStep >= 3 ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-200"></div>}
                      <span>Als Markdown in Obsidian gespeichert!</span>
                    </div>
                  </div>
                )}

                {importResponse && (
                  <div className="mt-8 p-4 bg-emerald-900/20 border border-emerald-500/30 rounded-lg">
                    <p className="text-emerald-400 font-bold mb-2">{importResponse.message}</p>
                    <p className="text-slate-600 text-sm">Gespeichert unter: <code className="bg-black/50 px-2 py-1 rounded">{importResponse.path}</code></p>
                  </div>
                )}
              </div>
          </div>
        )}

        {/* PRODUCTION STUDIO */}
        {activeTab === 'studio' && (
          <div className="px-8 md:px-12 pt-10 pb-32 max-w-7xl mx-auto w-full">
            <header className="mb-10 flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-bold mb-2 text-slate-900">Reel-Studio (E2E Pipeline)</h2>
                <p className="text-slate-500 text-lg">Der wasserdichte Produktionszyklus inkl. A/B-Hooks, Video-QA und Upload-Paket.</p>
              </div>
              <div className="flex items-center gap-3 bg-white border border-slate-200 p-2 rounded-xl shadow-sm">
                <span className={`text-sm font-bold px-3 py-1.5 rounded-lg transition-colors ${!isAutopilot ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-50 cursor-pointer'}`} onClick={() => setIsAutopilot(false)}>
                  Director Mode
                </span>
                <span className={`text-sm font-bold px-3 py-1.5 rounded-lg transition-colors ${isAutopilot ? 'bg-purple-100 text-purple-700' : 'text-slate-500 hover:bg-slate-50 cursor-pointer'}`} onClick={() => setIsAutopilot(true)}>
                  Autopilot
                </span>
              </div>
            </header>
            <div className="bg-slate-100 rounded-2xl border border-slate-200 p-8 shadow-2xl">
              <div className="mb-10 relative">
                <label className="block text-sm font-bold text-slate-600 mb-3 uppercase tracking-wide flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-purple-600" /> 
                  Creative Director Briefing
                </label>
                <div className="relative group mb-4">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
                  <textarea 
                    value={topic} 
                    onChange={(e) => setTopic(e.target.value)} 
                    placeholder="👉 Bitte tippe hier dein Thema ein (z.B. 'Warum Stoizismus im Alltag hilft...')"
                    className="relative w-full bg-white border border-slate-200 rounded-xl p-5 text-slate-900 font-medium focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition shadow-inner min-h-[120px] resize-y placeholder:text-slate-400 placeholder:italic"
                  />
                </div>
                
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-slate-500 font-medium w-36">Recherche-Fokus:</span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="scope" 
                        value="kb_and_web" 
                        checked={researchScope === 'kb_and_web'} 
                        onChange={(e) => setResearchScope(e.target.value as any)}
                        className="accent-purple-500"
                      />
                      <span className={researchScope === 'kb_and_web' ? 'text-purple-600 font-bold' : 'text-slate-500'}>KB + Internet</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="scope" 
                        value="kb_only" 
                        checked={researchScope === 'kb_only'} 
                        onChange={(e) => setResearchScope(e.target.value as any)}
                        className="accent-indigo-500"
                      />
                      <span className={researchScope === 'kb_only' ? 'text-indigo-600 font-bold' : 'text-slate-500'}>Nur Knowledge Base</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="scope" 
                        value="web_only" 
                        checked={researchScope === 'web_only'} 
                        onChange={(e) => setResearchScope(e.target.value as any)}
                        className="accent-emerald-500"
                      />
                      <span className={researchScope === 'web_only' ? 'text-emerald-400 font-bold' : 'text-slate-500'}>Nur Internet</span>
                    </label>
                  </div>
                  
                  <div className={`flex items-center gap-4 text-sm transition-opacity ${researchScope === 'web_only' ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                    <span className="text-slate-500 font-medium w-36">Wissens-Quelle:</span>
                    <select 
                      value={moduleFilter} 
                      onChange={(e) => setModuleFilter(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
                    >
                      <option value="all">Gesamte Knowledge Base (Auto-Search)</option>
                      {kbStructure.map(mod => (
                        <optgroup key={mod.id} label={mod.name}>
                          <option value={mod.id}>[{mod.name}] - Alles durchsuchen</option>
                          {mod.submodules?.map((sub: any) => (
                            <option key={sub.path} value={sub.path}>{sub.name}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 mb-10 border border-slate-200/50 shadow-inner">
                {/* Pipeline visual */}
                <div className="flex justify-between items-center mb-8 relative px-2">
                  <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-slate-100 rounded-full"></div>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 h-1 bg-indigo-500 rounded-full transition-all duration-700 ease-in-out" style={{ width: `${Math.min((Math.max(0, activeStep - 1) / (studioPipeline.length - 1)) * 100, 100)}%`, maxWidth: 'calc(100% - 2rem)' }}></div>
                  
                  {studioPipeline.map((step, idx) => (
                    <div key={idx} className="relative z-10 flex flex-col items-center gap-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 shadow-lg transition-all duration-300 ${
                        idx < (activeStep - 1) ? 'bg-slate-100 border-indigo-500' : 
                        idx === (activeStep - 1) ? (isRunning ? 'bg-slate-100 border-purple-400 animate-pulse scale-125' : 'bg-white border-indigo-300 shadow-md scale-110') : 
                        'bg-white border-slate-200 opacity-50 grayscale'
                      }`}>
                        {idx < (activeStep - 1) ? <CheckCircle2 className="w-5 h-5 text-indigo-600" /> : (step?.avatar?.startsWith('/') ? <img src={step.avatar} className="w-6 h-6 object-cover rounded-full" alt={step.name} /> : step?.avatar)}
                      </div>
                      <span className={`text-[9px] font-bold uppercase tracking-wider ${idx === (activeStep - 1) ? 'text-indigo-600 font-extrabold' : (idx < (activeStep - 1) ? 'text-slate-900' : 'text-slate-400')}`}>{step?.name}</span>
                    </div>
                  ))}
                </div>
                {/* Director Workspace Pipeline Interactive Area */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                  <h3 className="font-bold mb-4 flex items-center gap-2 text-indigo-700">
                    <Search className="w-5 h-5"/> Director Workspace
                  </h3>
                  
                  {(() => {
                    const activePiece = contentPieces.find(p => p.id === localStorage.getItem('activePipelineSession'));
                    
                    if (activeStep === 0) return <div className="text-slate-500">Gebe oben dein Thema ein und klicke auf "E2E Produktion starten".</div>;
                    if (!activePiece) return <div className="text-slate-500 animate-pulse">Initialisiere Pipeline (Zeus)...</div>;

                    if (activeStep === 1) return <div className="text-blue-600 font-bold animate-pulse flex items-center gap-2"><div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div> Prometheus forscht in der Knowledge Base...</div>;
                    
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

                    if (activeStep === 4) return <div className="text-teal-600 font-bold animate-pulse flex items-center gap-2"><div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div> Themis prüft das Skript (QA)...</div>;
                    

                                        if (activeStep >= 5) {
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
                            <div className={`p-4 border rounded-xl mb-4 ${isFinished ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-indigo-50 border-indigo-200 text-indigo-700"}`}>
                              <p className="font-bold flex items-center gap-2">{isFinished ? <CheckCircle2 className="w-5 h-5"/> : <Wand2 className="w-5 h-5"/>}{isFinished ? "Produktion abgeschlossen" : "Produktion läuft (Phase 2 & 3)"}</p>
                              <p className="text-sm mt-1">{isFinished ? "Das finale Reel steht unten zur Verfügung." : "Die ausgewählte Hook wird verarbeitet. Du kannst den Fortschritt unten live verfolgen."}</p>
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
                                  className={`text-left p-4 rounded-xl border-2 transition-all group ${
                                    isSelected ? 'bg-indigo-50 border-indigo-500 shadow-md ring-2 ring-indigo-200' :
                                    isDisabled ? 'bg-slate-50 border-slate-200 opacity-40 grayscale cursor-not-allowed' :
                                    'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-md cursor-pointer'
                                  }`}
                                >
                                  <div className="flex justify-between items-center mb-1">
                                    <p className={`text-xs font-bold uppercase tracking-wider transition-colors ${isSelected ? 'text-indigo-700' : 'text-slate-500 group-hover:text-indigo-500'}`}>Option {i+1} {isSelected && '(Ausgewählt)'}</p>
                                    {!isDisabled && <Play className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-indigo-400 opacity-0 group-hover:opacity-100'} transition-opacity`} />}
                                  </div>
                                  <p className={`text-sm leading-relaxed ${isSelected ? 'text-indigo-900 font-medium' : 'text-slate-900'}`}>{hookText}</p>
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
                                  <div className={`flex items-center gap-3 transition-opacity ${activePiece.status === 'voiceover' || activePiece.status === 'visuals' || activePiece.status === 'rendering' ? 'opacity-100 text-blue-600' : 'opacity-30'}`}>
                                    {activePiece.status === 'visuals' || activePiece.status === 'visuals_ready' || activePiece.status === 'rendering' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
                                    <span>Hephaistos generiert Voiceover (ElevenLabs) & Timestamps (Whisper)...</span>
                                  </div>
                                  <div className={`flex items-center gap-3 transition-opacity ${activePiece.status === 'visuals' || activePiece.status === 'rendering' ? 'opacity-100 text-purple-600' : 'opacity-30'}`}>
                                    {activePiece.status === 'rendering' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : (activePiece.status === 'visuals' ? <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div> : <div className="w-5 h-5 rounded-full border-2 border-slate-200"></div>)}
                                    <span>Maya erstellt 3D-Metaphern (Higgsfield) & Storyboard...</span>
                                  </div>
                                  <div className={`flex items-center gap-3 transition-opacity ${activePiece.status === 'rendering' ? 'opacity-100 text-orange-600' : 'opacity-30'}`}>
                                    {activePiece.status === 'completed' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : (activePiece.status === 'rendering' ? <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div> : <div className="w-5 h-5 rounded-full border-2 border-slate-200"></div>)}
                                    <span>HyperFrames rendert das finale Video synchron...</span>
                                  </div>
                                </div>
                              ) : isFinished ? (
                                <div>
                                  <div className="mb-6 rounded-xl overflow-hidden border-4 border-slate-200 shadow-md bg-black">
                                    <video controls className="w-full max-h-[500px]" src={`${activePiece.videoUrl?.startsWith('http') ? activePiece.videoUrl : `http://localhost:4000${activePiece.videoUrl}`}?t=${new Date(activePiece.updatedAt).getTime()}`} />
                                  </div>
                                  
                                  <div className="flex flex-col gap-3">
                                    <button onClick={() => { 
                                      showToast("Distribution auf Instagram gestartet!", "info");
                                      setTimeout(() => {
                                        showToast("Reel erfolgreich auf Instagram veröffentlicht! Pipeline abgeschlossen.", "success");
                                        localStorage.removeItem('activePipelineSession');
                                        setActiveStep(0);
                                      }, 3000);
                                    }} className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white px-6 py-4 rounded-xl font-bold shadow-lg transition-colors flex items-center justify-center gap-2 text-lg">
                                      <Zap className="w-6 h-6" /> Auf Instagram veröffentlichen
                                    </button>
                                    <div className="flex gap-4">
                                      <button onClick={() => {
                                        showToast('Rendern erneut gestartet...', 'info');
                                        renderVideo(activePiece.id);
                                      }} className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-4 rounded-lg font-bold shadow-sm transition-colors flex items-center justify-center gap-2 w-full">
                                        <RefreshCcw className="w-5 h-5" /> Neu Rendern
                                      </button>
                                    </div>
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
                                  <audio controls className="w-full mb-4 h-12 rounded-lg bg-slate-50 border border-slate-200 shadow-sm" src={`${activePiece.audioUrl}?t=${new Date(activePiece.updatedAt).getTime()}`} />
                                  
                                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-4 h-32 overflow-y-auto">
                                    <p className="text-xs font-bold text-slate-500 mb-2 uppercase">Whisper Timestamp Data (Vorschau)</p>
                                    <div className="flex flex-wrap gap-1">
                                      {activePiece.timestamps?.map((ts: any, idx: number) => (
                                        <span key={idx} className="text-xs bg-indigo-100 text-indigo-700 px-1 rounded border border-indigo-200" title={`${ts.start}s - ${ts.end}s`}>{ts.word}</span>
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
                    
                  })()}
                </div>
              </div>

              <div className="flex justify-end gap-4 mb-6 w-full">
                {activeStep > 0 && activeStep < 8 && (
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
                  <div className="flex gap-4">
                    <button onClick={startPipeline} disabled={!topic} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-8 rounded-xl flex items-center gap-3 transition shadow-xl disabled:opacity-50 disabled:cursor-not-allowed">
                      E2E Produktion starten
                    </button>
                    {activeStep > 0 && (
                      <button onClick={resetPipeline} className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-4 px-8 rounded-xl flex items-center gap-3 transition shadow-xl">
                        Neue Produktion
                      </button>
                    )}
                  </div>
                ) : (
                  <button disabled className="bg-indigo-600 opacity-50 text-white font-bold py-4 px-8 rounded-xl flex items-center gap-3 transition shadow-xl">
                    Pipeline läuft...
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* CONTENT HUB */}
        {activeTab === 'hub' && (
          <div className="px-8 md:px-12 pt-10 pb-32 max-w-7xl mx-auto w-full">
            <header className="mb-10 flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold mb-2 text-slate-900">Content Hub</h2>
                <p className="text-slate-500 text-lg">Galerie deiner fertiggestellten Content-Pieces (Ready for Distribution).</p>
              </div>
              <button onClick={() => setActiveTab('studio')} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-6 rounded-xl transition shadow-xl">
                + Neues Reel
              </button>
            </header>

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
                    <div className="absolute top-6 right-6 flex items-center gap-3">
                      <button onClick={() => rerenderContent(piece.id)} className="text-slate-400 hover:text-indigo-600 transition-colors bg-white p-2 rounded-full shadow-sm hover:shadow-md border border-slate-200" title="Video neu rendern">
                        <RefreshCcw className="w-4 h-4" />
                      </button>
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
                            <p className="text-sm font-bold text-emerald-800">Finales Video</p>
                            <p className="text-xs text-emerald-600">Motion Graphics & Voiceover</p>
                          </div>
                        </div>
                        <div className="rounded-lg overflow-hidden border-2 border-emerald-100 shadow-sm flex justify-center bg-black">
                          <video 
                            controls 
                            className="max-h-[500px] w-full object-contain" 
                            src={`${piece.videoUrl.startsWith('http') ? piece.videoUrl : `http://localhost:4000${piece.videoUrl}`}?t=${new Date(piece.updatedAt).getTime()}`} 
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
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <LogsTab />
        )}
      </div>

            {confirmDeleteId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in" onClick={() => setConfirmDeleteId(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Eintrag löschen</h3>
                  <p className="text-sm text-slate-500 mt-1">Möchtest du dieses Content Piece wirklich unwiderruflich löschen?</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setConfirmDeleteId(null)} className="px-4 py-2 font-bold text-slate-500 hover:text-slate-700 transition">Abbrechen</button>
              <button onClick={() => executeDeleteContent(confirmDeleteId)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition shadow-sm">Löschen</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-4 rounded-xl shadow-2xl font-bold flex items-center gap-3 z-50 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${toast.type === 'success' ? 'bg-emerald-600 text-white' : toast.type === 'info' ? 'bg-blue-600 text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : toast.type === 'info' ? <Activity className="w-6 h-6 animate-pulse" /> : <XCircle className="w-6 h-6" />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
