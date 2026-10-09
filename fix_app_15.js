const fs = require('fs');
let code = fs.readFileSync('agentic-cockpit/src/App.tsx', 'utf8');

// Remove renderVideo
const renderRegex = /const renderVideo = async \(id: string\) => \{[\s\S]*?\}\s*catch \(e: any\) \{[\s\S]*?\}\s*finally \{[\s\S]*?\}\s*\};/g;
code = code.replace(renderRegex, '');

// Remove Zap import
code = code.replace(', Zap', '');

fs.writeFileSync('agentic-cockpit/src/App.tsx', code);
