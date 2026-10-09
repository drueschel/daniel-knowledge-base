const fs = require('fs');
let code = fs.readFileSync('agentic-cockpit/src/App.tsx', 'utf8');

// Fix showToast function signature
code = code.replace(/showToast = \(message: string, type\?: 'success' \| 'error'\)/, "showToast = (message: string, type?: 'success' | 'error' | 'info')");
code = code.replace(/showToast = \(message: string, type: 'success' \| 'error' = 'success'\)/, "showToast = (message: string, type: 'success' | 'error' | 'info' = 'success')");
code = code.replace(/type\?: 'success'\|'error'/g, "type?: 'success'|'error'|'info'");

// Remove unused vars
code = code.replace(/const \[stepTimes, setStepTimes\] = useState<Record<string, string>>\(\{\}\);/, "");
code = code.replace(/const \[isWaitingForApproval, setIsWaitingForApproval\] = useState\(false\);/, "");
code = code.replace(/Circle, /, "");

fs.writeFileSync('agentic-cockpit/src/App.tsx', code);
