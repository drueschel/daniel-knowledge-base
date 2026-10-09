import { useState, useMemo } from 'react';
import { ShieldAlert, CheckCircle2, Search, Database, ScrollText } from 'lucide-react';

export default function HistoryTab({ logs, employees, contentPieces }: { logs: any[], employees: any[], contentPieces: any[] }) {
  const [filterAgent, setFilterAgent] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [groupBy, setGroupBy] = useState<'session' | 'timeline'>('session');

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      if (filterAgent !== 'all' && log.agentId !== filterAgent) return false;
      if (filterStatus !== 'all' && log.status !== filterStatus) return false;
      if (searchQuery && !log.action.toLowerCase().includes(searchQuery.toLowerCase()) && !log.details?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [logs, filterAgent, filterStatus, searchQuery]);

  const groupedBySession = useMemo(() => {
    const groups: Record<string, any[]> = {};
    filteredLogs.forEach(log => {
      const sId = log.sessionId || 'Unbekannter Prozess';
      if (!groups[sId]) groups[sId] = [];
      groups[sId].push(log);
    });
    return groups;
  }, [filteredLogs]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'error': return <ShieldAlert className="w-5 h-5 text-red-400" />;
      case 'warning': return <ShieldAlert className="w-5 h-5 text-amber-400" />;
      case 'success': default: return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'error': return 'bg-red-500/5 border border-red-500/20';
      case 'warning': return 'bg-amber-500/5 border border-amber-500/20';
      case 'success': default: return 'bg-emerald-500/5 border border-emerald-500/20';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Operations Log & E2E Historie</h2>
          <p className="text-slate-500 mt-2 text-sm">Verfolge jeden E2E-Produktionsprozess und analysiere die Agenten-Performance in Echtzeit.</p>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-white border border-slate-200/50 p-4 rounded-xl flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Suchen in Logs..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-sm text-slate-900 focus:border-blue-500 outline-none"
          />
        </div>
        
        <select 
          value={filterAgent} 
          onChange={(e) => setFilterAgent(e.target.value)}
          className="bg-white border border-slate-200 rounded-lg py-2 px-4 text-sm text-slate-600 outline-none"
        >
          <option value="all">Alle Agenten</option>
          {employees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.role})</option>)}
        </select>

        <select 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-white border border-slate-200 rounded-lg py-2 px-4 text-sm text-slate-600 outline-none"
        >
          <option value="all">Alle Status</option>
          <option value="success">Erfolgreich</option>
          <option value="warning">Warnungen / Reworks</option>
          <option value="error">Kritische Fehler</option>
        </select>

        <div className="flex bg-white p-1 rounded-lg border border-slate-200">
          <button onClick={() => setGroupBy('session')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${groupBy === 'session' ? 'bg-slate-200 text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>Nach E2E Prozess</button>
          <button onClick={() => setGroupBy('timeline')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${groupBy === 'timeline' ? 'bg-slate-200 text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>Live Timeline</button>
        </div>
      </div>

      {/* Data View */}
      <div className="space-y-8">
        {groupBy === 'session' ? Object.keys(groupedBySession).map((sId) => {
          const processLogs = groupedBySession[sId];
          const contentMeta = contentPieces.find(c => c.id === sId) || { topic: 'Unbekanntes Thema' };
          
          return (
            <div key={sId} className="bg-white border border-slate-200/50 rounded-2xl overflow-hidden shadow-xl">
              <div className="bg-indigo-50 p-5 border-b border-slate-200/50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500/15 p-2 rounded-lg">
                    <Database className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">E2E Prozess: {contentMeta.topic}</h3>
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-1">ID: {sId}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 font-medium">{processLogs.length} Agenten-Aktionen</span>
                </div>
              </div>
              
              <div className="p-0">
                <div className="divide-y divide-slate-700/50">
                  {processLogs.map((log, i) => {
                    const emp = employees.find(e => e.id === log.agentId);
                    return (
                      <div key={i} className={`p-4 flex gap-4 hover:bg-slate-100/30 transition-colors ${i === 0 ? '' : ''}`}>
                        <div className={`p-2 rounded-xl h-fit border ${getStatusBg(log.status)}`}>
                          {getStatusIcon(log.status)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-slate-900 flex items-center gap-2">
                              {emp ? emp.name : log.agentId}
                              <span className="text-xs font-normal text-slate-500 border border-slate-200 bg-slate-100 px-2 py-0.5 rounded-full">{log.model || 'System'}</span>
                            </span>
                            <span className="text-xs text-slate-500 font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <p className="text-slate-900 font-medium text-[15px] leading-relaxed">{log.action}</p>
                          {log.details && (
                            <div className="mt-3 p-4 bg-white rounded-xl border border-slate-200/50 shadow-inner">
                              <p className="text-slate-600 text-[13px] font-mono whitespace-pre-wrap leading-relaxed">{log.details}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="bg-white border border-slate-200/50 rounded-2xl overflow-hidden shadow-xl p-4 space-y-4">
            {filteredLogs.map((log, i) => {
              const emp = employees.find(e => e.id === log.agentId);
              return (
                <div key={i} className={`p-4 rounded-xl flex gap-4 border ${getStatusBg(log.status)} bg-white`}>
                  <div className="p-2 rounded-xl h-fit border border-slate-200 bg-white">
                    {getStatusIcon(log.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 flex items-center gap-2">
                        {emp ? emp.name : log.agentId}
                        <span className="text-xs font-normal text-slate-500 border border-slate-200 bg-slate-100 px-2 py-0.5 rounded-full">{log.model || 'System'}</span>
                      </span>
                      <span className="text-xs text-slate-500 font-mono flex items-center gap-2">
                        <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                        <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </span>
                    </div>
                    <p className="text-slate-900 font-medium text-[15px] leading-relaxed">{log.action}</p>
                    {log.details && (
                      <p className="text-slate-500 text-xs mt-1 truncate max-w-2xl">{log.details}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {filteredLogs.length === 0 && (
          <div className="text-center p-12 border-2 border-dashed border-slate-200 rounded-2xl">
            <ScrollText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-500">Keine Logs gefunden</h3>
            <p className="text-slate-500 mt-1">Ändere deine Filter oder starte einen neuen E2E-Prozess.</p>
          </div>
        )}
      </div>
    </div>
  );
}
