const fs = require('fs');
let code = fs.readFileSync('agentic-cockpit/src/App.tsx', 'utf8');

// Fix the activeStep(6) bug in checkPipelineStatus when it's waiting for hooks
code = code.replace(
  /if \(state\.script \|\| state\.qa\) \{\s*setActiveStep\(6\);\s*\} else if/g,
  "if (state.script || state.qa) { setActiveStep(5); setIsRunning(false); } else if"
);

// If state.strategy exists, set it to 3 and pause (in case of page refresh in Director mode)
code = code.replace(
  /else if \(state\.strategy\) \{\s*setActiveStep\(3\);\s*\}/g,
  "else if (state.strategy) { setActiveStep(3); setIsRunning(false); }"
);

// If state.research exists, set it to 2 and pause
code = code.replace(
  /else if \(state\.research\) \{\s*setActiveStep\(2\);\s*\}/g,
  "else if (state.research) { setActiveStep(2); setIsRunning(false); }"
);

fs.writeFileSync('agentic-cockpit/src/App.tsx', code);
