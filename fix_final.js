const fs = require('fs');
let code = fs.readFileSync('agentic-cockpit/src/App.tsx', 'utf8');

// Fix the import wrapper
const brokenImport = `{activeTab === 'import' && (
            <header className="mb-10">`;
const fixedImport = `{activeTab === 'import' && (
          <div className="px-8 md:px-12 pt-10 pb-32 max-w-5xl mx-auto w-full">
            <header className="mb-10">`;
code = code.replace(brokenImport, fixedImport);

// And we need to close that wrapper. Where?
// Let's look for the end of the import block.
const endImport = `        {/* PRODUCTION STUDIO */}`;
const fixedEndImport = `          </div>
        )}
        {/* PRODUCTION STUDIO */}`;
code = code.replace(endImport, fixedEndImport);

// Fix the backticks in videoUrl
code = code.replace(/\\`http:\/\/localhost:4000\\\$\\{activePiece\.videoUrl\\}\\`/g, "`http://localhost:4000${activePiece.videoUrl}`");
code = code.replace(/\\`\}\\?t=\\\\\$\\{new Date\\(activePiece\.updatedAt\\)\.getTime\(\)\\}\`\}/g, "`}?t=${new Date(activePiece.updatedAt).getTime()}`}");

// Replace all weird escaped backticks
code = code.replace(/\\\$/g, "$");
code = code.replace(/\\`/g, "`");

fs.writeFileSync('agentic-cockpit/src/App.tsx', code);
