const fs = require('fs');
let code = fs.readFileSync('agentic-cockpit/src/App.tsx', 'utf8');

const wrongEnding = `        {activeTab === 'logs' && (
          <LogsTab />
        )}
      </div>

            {confirmDeleteId && (`;
            
const rightEnding = `        {activeTab === 'logs' && (
          <LogsTab />
        )}

            {confirmDeleteId && (`;
            
code = code.replace(wrongEnding, rightEnding);
fs.writeFileSync('agentic-cockpit/src/App.tsx', code);
