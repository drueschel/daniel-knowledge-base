const fs = require('fs');
let code = fs.readFileSync('agentic-cockpit/src/App.tsx', 'utf8');

// Put back isWaitingForApproval
code = code.replace(/const \[topic, setTopic\] = useState/, "const [isWaitingForApproval, setIsWaitingForApproval] = useState(false);\n  const [topic, setTopic] = useState");

// Comment out unused functions
code = code.replace(/const resumePipeline = /g, "// const resumePipeline = ");
code = code.replace(/const nextStepDirector = /g, "// const nextStepDirector = ");

fs.writeFileSync('agentic-cockpit/src/App.tsx', code);
