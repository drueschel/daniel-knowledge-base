const fs = require('fs');
let code = fs.readFileSync('agentic-cockpit/src/App.tsx', 'utf8');

// 1. Update showToast signature
code = code.replace(
  /const showToast = \(message: string, type: 'success' \| 'error'\) => \{/g,
  "const showToast = (message: string, type: 'success' | 'error' | 'info') => {"
);

// 2. Change setToast to showToast in approveHook
code = code.replace(
  /setToast\(\{ message: 'Produktion gestartet \(Hephaistos & HyperFrames arbeiten\)\.\.\.', type: 'info' \}\);/g,
  "showToast('Produktion gestartet (Hephaistos & HyperFrames arbeiten)...', 'info');"
);
code = code.replace(
  /setToast\(\{ message: \`Produktions-Fehler: \$\{e\.message\}\`, type: 'error' \}\);/g,
  "showToast(`Produktions-Fehler: ${e.message}`, 'error');"
);

// 3. Update the toast render logic at the bottom of the file to support 'info'
const oldToastRender = `toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-500 text-white'`;
const newToastRender = `toast.type === 'success' ? 'bg-emerald-600 text-white' : toast.type === 'info' ? 'bg-blue-600 text-white' : 'bg-red-500 text-white'`;
code = code.replace(oldToastRender, newToastRender);

const oldToastIcon = `{toast.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}`;
const newToastIcon = `{toast.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : toast.type === 'info' ? <Activity className="w-6 h-6 animate-pulse" /> : <XCircle className="w-6 h-6" />}`;
code = code.replace(oldToastIcon, newToastIcon);

fs.writeFileSync('agentic-cockpit/src/App.tsx', code);
