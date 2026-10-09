const fs = require('fs');
let code = fs.readFileSync('agentic-cockpit/src/App.tsx', 'utf8');

// 1. Remove that weird broken import line
code = code.replace(/{activeTab === 'import' {activeTab === 'import'.*/g, "{activeTab === 'import' && (\n          <div className=\"px-8 md:px-12 pt-10 pb-32 max-w-7xl mx-auto w-full\">");

fs.writeFileSync('agentic-cockpit/src/App.tsx', code);
