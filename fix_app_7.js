const fs = require('fs');
let code = fs.readFileSync('agentic-cockpit/src/App.tsx', 'utf8');

// 1. Reorder the studioPipeline array so the visual nodes match the actual pipeline flow
const oldPipelineArray = `  const studioPipeline = [
    employees.find(e => e.id === 'data') || { name: 'Prometheus', avatar: '/avatars/prometheus.svg' },
    employees.find(e => e.id === 'strategy') || { name: 'Athena', avatar: '/avatars/athena.svg' },
    employees.find(e => e.id === 'creative') || { name: 'Calliope', avatar: '/avatars/calliope.svg' },
    employees.find(e => e.id === 'production') || { name: 'Hephaistos', avatar: '/avatars/hephaistos.svg' },
    { id: 'render', name: 'HyperFrames', avatar: '🎬', role: 'System' },
    employees.find(e => e.id === 'qa') || { name: 'Themis', avatar: '/avatars/themis.svg' },
    employees.find(e => e.id === 'community') || { name: 'Aphrodite', avatar: '/avatars/aphrodite.svg' }
  ];`;

const newPipelineArray = `  const studioPipeline = [
    employees.find(e => e.id === 'data') || { name: 'Prometheus', avatar: '/avatars/prometheus.svg' },
    employees.find(e => e.id === 'strategy') || { name: 'Athena', avatar: '/avatars/athena.svg' },
    employees.find(e => e.id === 'creative') || { name: 'Calliope', avatar: '/avatars/calliope.svg' },
    employees.find(e => e.id === 'qa') || { name: 'Themis', avatar: '/avatars/themis.svg' },
    employees.find(e => e.id === 'production') || { name: 'Hephaistos', avatar: '/avatars/hephaistos.svg' },
    { id: 'render', name: 'HyperFrames', avatar: '🎬', role: 'System' },
    employees.find(e => e.id === 'community') || { name: 'Aphrodite', avatar: '/avatars/aphrodite.svg' }
  ];`;

code = code.replace(oldPipelineArray, newPipelineArray);

// 2. Fix the visual rendering logic so activeStep - 1 is the actual active index.
const oldRenderLogic = `idx < activeStep ? 'bg-slate-100 border-indigo-500' : 
                        idx === activeStep && isRunning ? 'bg-slate-100 border-purple-400 animate-pulse scale-125' : 
                        'bg-white border-slate-200 opacity-50 grayscale'`;

const newRenderLogic = `idx < (activeStep - 1) ? 'bg-slate-100 border-indigo-500' : 
                        idx === (activeStep - 1) && isRunning ? 'bg-slate-100 border-purple-400 animate-pulse scale-125' : 
                        'bg-white border-slate-200 opacity-50 grayscale'`;

code = code.replace(oldRenderLogic, newRenderLogic);

// 3. Fix the checkmark icon rendering
const oldCheckmarkLogic = `{idx < activeStep ? <CheckCircle2 className="w-5 h-5 text-indigo-600" /> : (step?.avatar?.startsWith('/') ? <img src={step.avatar} className="w-6 h-6 object-cover rounded-full" alt={step.name} /> : step?.avatar)}`;

const newCheckmarkLogic = `{idx < (activeStep - 1) ? <CheckCircle2 className="w-5 h-5 text-indigo-600" /> : (step?.avatar?.startsWith('/') ? <img src={step.avatar} className="w-6 h-6 object-cover rounded-full" alt={step.name} /> : step?.avatar)}`;

code = code.replace(oldCheckmarkLogic, newCheckmarkLogic);

// 4. Fix the text color logic below the circles
const oldTextLogic = \`className={\\\`text-[9px] font-bold uppercase tracking-wider \${idx <= activeStep ? 'text-slate-900' : 'text-slate-500'}\`}\`;
const newTextLogic = \`className={\\\`text-[9px] font-bold uppercase tracking-wider \${idx <= (activeStep - 1) ? 'text-slate-900' : 'text-slate-500'}\`}\`;
code = code.replace(oldTextLogic, newTextLogic);

fs.writeFileSync('agentic-cockpit/src/App.tsx', code);
