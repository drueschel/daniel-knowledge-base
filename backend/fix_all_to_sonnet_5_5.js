const fs = require('fs');
const files = [
  'src/agents/ElenaResearchAgent.ts',
  'src/agents/MiaStrategyAgent.ts',
  'src/agents/LeoScriptAgent.ts',
  'src/agents/SarahQaAgent.ts',
  'src/agents/FelixIngestionAgent.ts',
  'src/services/EmployeeService.ts',
  'src/services/KnowledgeBaseService.ts'
];

files.forEach(path => {
  if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    content = content.replace(/claude-3-haiku-20240307/g, 'claude-sonnet-5-5');
    fs.writeFileSync(path, content);
    console.log(`Updated model in ${path}`);
  }
});
