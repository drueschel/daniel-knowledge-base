const fs = require('fs');
let code = fs.readFileSync('agentic-cockpit/src/App.tsx', 'utf8');

// Fix lucide-react import
code = code.replace(/import \{([^}]+)\} from 'lucide-react';/, "import { $1, Search, Zap } from 'lucide-react';");

// Fix toast type
code = code.replace(/type: 'success'\|'error'\}/g, "type: 'success'|'error'|'info'}");
code = code.replace(/type: 'success' \| 'error'\}/g, "type: 'success' | 'error' | 'info'}");

fs.writeFileSync('agentic-cockpit/src/App.tsx', code);
