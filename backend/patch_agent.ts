import fs from 'fs';
const path = 'src/agents/FelixIngestionAgent.ts';
let code = fs.readFileSync(path, 'utf8');
code = code.replace(
  "const contentBlock = response.content[0];",
  `const contentBlock = response.content[0];\n      this.log("Raw Response Content: " + JSON.stringify(response.content));\n      if (!contentBlock) return "EMPTY RESPONSE";`
);
fs.writeFileSync(path, code);
