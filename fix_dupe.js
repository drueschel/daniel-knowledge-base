const fs = require('fs');
let code = fs.readFileSync('agentic-cockpit/src/App.tsx', 'utf8');

// Remove the duplicated generateVisuals function
code = code.replace(/  const generateVisuals = async \(id: string\) => \{[\s\S]*?  \};\n\n/, "");

fs.writeFileSync('agentic-cockpit/src/App.tsx', code);
