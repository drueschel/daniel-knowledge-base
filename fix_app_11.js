const fs = require('fs');
let code = fs.readFileSync('agentic-cockpit/src/App.tsx', 'utf8');

const regex = /if \(activeStep === 6\) \{[\s\S]*?\} \(\)\)}/g;

code = code.replace(regex, '}() )}');

fs.writeFileSync('agentic-cockpit/src/App.tsx', code);
