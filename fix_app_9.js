const fs = require('fs');
let code = fs.readFileSync('agentic-cockpit/src/App.tsx', 'utf8');

// 1. Fix the progress bar width calculation to match the zero-indexed nodes
code = code.replace(
  /width: \`\$\{Math\.min\(\(activeStep \/ \(studioPipeline\.length - 1\)\) \* 100, 100\)\}\%\`/g,
  "width: `${Math.min((Math.max(0, activeStep - 1) / (studioPipeline.length - 1)) * 100, 100)}%`"
);

// 2. Fix the styling of the nodes so the "waiting" node is not grayscale
const oldNodeRender = `idx < (activeStep - 1) ? 'bg-slate-100 border-indigo-500' : 
                        idx === (activeStep - 1) && isRunning ? 'bg-slate-100 border-purple-400 animate-pulse scale-125' : 
                        'bg-white border-slate-200 opacity-50 grayscale'`;

const newNodeRender = `idx < (activeStep - 1) ? 'bg-slate-100 border-indigo-500' : 
                        idx === (activeStep - 1) ? (isRunning ? 'bg-slate-100 border-purple-400 animate-pulse scale-125' : 'bg-white border-indigo-300 shadow-md scale-110') : 
                        'bg-white border-slate-200 opacity-50 grayscale'`;

code = code.replace(oldNodeRender, newNodeRender);

// 3. Fix the label text color for the waiting node
const oldLabelRender = `idx <= (activeStep - 1) ? 'text-slate-900' : 'text-slate-500'`;
const newLabelRender = `idx === (activeStep - 1) ? 'text-indigo-600 font-extrabold' : (idx < (activeStep - 1) ? 'text-slate-900' : 'text-slate-400')`;
code = code.replace(oldLabelRender, newLabelRender);

fs.writeFileSync('agentic-cockpit/src/App.tsx', code);
