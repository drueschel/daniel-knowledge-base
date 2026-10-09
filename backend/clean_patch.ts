import fs from 'fs';
const path = 'src/agents/FelixIngestionAgent.ts';
let code = fs.readFileSync(path, 'utf8');
code = code.replace(
  /const contentBlock = response\.content\[0\];[\s\S]*?if \(\!contentBlock\) return "EMPTY RESPONSE";/m,
  "const contentBlock = response.content[0];\n      return contentBlock.type === 'text' ? contentBlock.text : '';"
);
fs.writeFileSync(path, code);
