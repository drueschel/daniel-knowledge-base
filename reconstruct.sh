#!/bin/bash
git checkout agentic-cockpit/src/App.tsx

echo "1. Injecting Hub..."
awk 'NR<1335 {print} NR==1335 {system("cat hub_new.tsx")} NR>1555 {print}' agentic-cockpit/src/App.tsx > agentic-cockpit/src/App.tsx.tmp && mv agentic-cockpit/src/App.tsx.tmp agentic-cockpit/src/App.tsx

echo "2. Injecting Director Workspace..."
awk 'NR<960 {print} NR==960 {system("cat director_workspace.tsx")} NR>998 {print}' agentic-cockpit/src/App.tsx > agentic-cockpit/src/App.tsx.tmp && mv agentic-cockpit/src/App.tsx.tmp agentic-cockpit/src/App.tsx

echo "3. Injecting renderVideo..."
awk '/const \[isRunning, setIsRunning\]/ {print; system("cat render_video.tsx"); next} 1' agentic-cockpit/src/App.tsx > agentic-cockpit/src/App.tsx.tmp && mv agentic-cockpit/src/App.tsx.tmp agentic-cockpit/src/App.tsx

echo "4. Injecting isAutopilot..."
awk '/const \[isRunning, setIsRunning\]/ {print; system("cat autopilot_patch.tsx"); next} 1' agentic-cockpit/src/App.tsx > agentic-cockpit/src/App.tsx.tmp && mv agentic-cockpit/src/App.tsx.tmp agentic-cockpit/src/App.tsx

echo "5. Injecting Header Patch..."
awk '/<header className="mb-10">/ {system("cat header_patch.tsx"); skip=4; next} skip {skip--; next} 1' agentic-cockpit/src/App.tsx > agentic-cockpit/src/App.tsx.tmp && mv agentic-cockpit/src/App.tsx.tmp agentic-cockpit/src/App.tsx

echo "6. Injecting Import Header Fix..."
awk '/{activeTab === .import. && \(/ {print; system("cat fix_import_header.tsx"); skip=17; next} skip {skip--; next} 1' agentic-cockpit/src/App.tsx > agentic-cockpit/src/App.tsx.tmp && mv agentic-cockpit/src/App.tsx.tmp agentic-cockpit/src/App.tsx

echo "7. Replaying todays patches..."
node fix_app_2.js
node fix_app_3.js
node fix_app_4.js
node fix_app_5.js
node fix_app_6.js
node fix_app_8.js
node fix_app_9.js
node fix_app_10.js
node fix_app_11.js
node fix_app_12.js
node fix_app_13.js

echo "8. Minor fixes..."
sed -i '' 's/if (activeTab === .hub.) {/if (activeTab === '"'hub'"' || activeTab === '"'studio'"') {/g' agentic-cockpit/src/App.tsx

echo "DONE!"
