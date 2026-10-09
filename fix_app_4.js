const fs = require('fs');
let code = fs.readFileSync('agentic-cockpit/src/App.tsx', 'utf8');

// Use a robust regex to remove the resumePipeline function
// It looks like: const resumePipeline = async (id: string) => { ... };
code = code.replace(/const resumePipeline = async \([\s\S]*?checkPipelineStatus\(id\);\s*\} catch \(e\) \{\s*console\.error\(e\);\s*\}\s*\};\n/g, '');

fs.writeFileSync('agentic-cockpit/src/App.tsx', code);
