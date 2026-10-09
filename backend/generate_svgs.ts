import fs from 'fs';
import path from 'path';

const outDir = path.join(__dirname, '../agentic-cockpit/public/avatars');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const icons: Record<string, string> = {
  zeus: '<path d="M11 21l-1-7 5 0-6-10 1 7-5 0 6 10" stroke="#fcd34d" stroke-width="2" fill="none" />', // lightning bolt
  prometheus: '<path d="M12 22c4-4 4-8 4-11a8 8 0 0 0-16 0c0 3 0 7 4 11M12 22V12" stroke="#f87171" stroke-width="2" fill="none"/>', // flame
  athena: '<path d="M12 2v20M4 12h16M7 7l10 10M17 7L7 17" stroke="#22d3ee" stroke-width="2" fill="none" />', // strategy map/compass
  calliope: '<path d="M20 4L4 20M4 20l4-1M4 20l1-4" stroke="#c084fc" stroke-width="2" fill="none"/>', // quill/pen
  themis: '<path d="M12 4v16M8 8h8M6 12l2-4 2 4H6zM14 12l2-4 2 4h-4z" stroke="#fbbf24" stroke-width="2" fill="none" />', // scales
  hephaistos: '<path d="M4 18l10-10M12 8l4 4M14 6l4 4" stroke="#d1d5db" stroke-width="2" fill="none" />', // hammer/tools
  aphrodite: '<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="#f472b6" stroke-width="2" fill="none" />' // heart
};

for (const [name, pathData] of Object.entries(icons)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="512" height="512">
  <rect width="24" height="24" fill="#111827" />
  <g style="filter: drop-shadow(0px 0px 4px currentColor);">${pathData}</g>
</svg>`;
  fs.writeFileSync(path.join(outDir, `${name}.svg`), svg);
}

console.log("SVGs generated!");
