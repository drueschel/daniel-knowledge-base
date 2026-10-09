const fs = require('fs');
let code = fs.readFileSync('agentic-cockpit/src/App.tsx', 'utf8');

// Put back isWaitingForApproval
code = code.replace(/const \[topic, setTopic\] = useState/, "const [isWaitingForApproval, setIsWaitingForApproval] = useState(false);\n  const [topic, setTopic] = useState");

// Ignore unused functions
code = code.replace(/const resumePipeline = /g, "// @ts-ignore\n  const resumePipeline = ");
code = code.replace(/const nextStepDirector = /g, "// @ts-ignore\n  const nextStepDirector = ");

fs.writeFileSync('agentic-cockpit/src/App.tsx', code);
