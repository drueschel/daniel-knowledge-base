const fs = require('fs');
let code = fs.readFileSync('agentic-cockpit/src/App.tsx', 'utf8');

const wrongEnding = `              </div>

            </div>
          </div>
        )}

        {/* PRODUCTION STUDIO */}`;
        
const rightEnding = `              </div>

            </div>
          </div>
          </div>
        )}

        {/* PRODUCTION STUDIO */}`;
        
code = code.replace(wrongEnding, rightEnding);
fs.writeFileSync('agentic-cockpit/src/App.tsx', code);
