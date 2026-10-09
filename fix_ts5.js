const fs = require('fs');
let code = fs.readFileSync('agentic-cockpit/src/App.tsx', 'utf8');

code = code.replace(/const \[isWaitingForApproval, setIsWaitingForApproval\] = useState\(false\);/, "// @ts-ignore\n  const [isWaitingForApproval, setIsWaitingForApproval] = useState(false);");

fs.writeFileSync('agentic-cockpit/src/App.tsx', code);
