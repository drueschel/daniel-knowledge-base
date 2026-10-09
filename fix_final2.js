const fs = require('fs');
let code = fs.readFileSync('agentic-cockpit/src/App.tsx', 'utf8');

const wrongClosing = `            </div>
          </div>
        )}

          </div>
        )}
        {/* PRODUCTION STUDIO */}`;
        
const rightClosing = `            </div>
          </div>
        )}

        {/* PRODUCTION STUDIO */}`;
        
code = code.replace(wrongClosing, rightClosing);
fs.writeFileSync('agentic-cockpit/src/App.tsx', code);
