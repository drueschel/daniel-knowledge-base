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
