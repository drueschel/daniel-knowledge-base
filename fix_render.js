const fs = require('fs');
let code = fs.readFileSync('agentic-cockpit/src/App.tsx', 'utf8');

// Fix API Endpoint
code = code.replace(/fetch\(\`http:\/\/localhost:4000\/api\/studio\/pipeline\/render\/\$\{id\}\`/, "fetch(`http://localhost:4000/api/content/${id}/render`");

// Fix rendering states to match backend
code = code.replace(/activePiece\.status === 'render'/g, "activePiece.status === 'rendering'");

fs.writeFileSync('agentic-cockpit/src/App.tsx', code);
