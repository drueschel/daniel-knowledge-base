const fs = require('fs');
const path = require('path');

function cleanTranscript(text) {
  const lines = text.split('\n');
  const cleaned = [];
  let lastLine = '';
  let repeatCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trim();

    if (trimmed.length > 5 && trimmed === lastLine) {
      repeatCount++;
      continue;
    } else {
      if (repeatCount >= 3) {
        cleaned.push('*(Pause / Stille im Raum)*');
      }
      lastLine = trimmed;
      repeatCount = 0;
      cleaned.push(raw);
    }
  }
  return cleaned.join('\n');
}

const baseDir = '/Users/danielrueschel/DEV/daniel-knowledge-base';
const downloadDir = path.join(baseDir, 'tmp_downloads/gopal');
const deVollDir = path.join(baseDir, 'src/content/de/1_Die_Befreiung/Transkripte_Bibliothek/3_Geldmangel/Volltranskripte');
const enVollDir = path.join(baseDir, 'src/content/en/1_Die_Befreiung/Transkripte_Bibliothek/3_Geldmangel/Volltranskripte');

if (!fs.existsSync(deVollDir)) fs.mkdirSync(deVollDir, { recursive: true });
if (!fs.existsSync(enVollDir)) fs.mkdirSync(enVollDir, { recursive: true });

const sessions = [
  {
    num: "07",
    part: "Teil 1",
    enPart: "Part 1",
    client: "Andrea",
    duration: "ca. 43 Min.",
    fileBase: "07_Einzelsitzung_Geldmangel_Teil_1",
    deTitle: "Einzelsitzung: Geldmangel – Teil 1 (Andrea)",
    enTitle: "Individual Session: Money Scarcity – Part 1 (Andrea)",
    deSummaryFile: "../07_Einzelsitzung_Geldmangel_Teil_1_Summary",
    enSummaryFile: "../07_Einzelsitzung_Geldmangel_Teil_1_Summary"
  },
  {
    num: "08",
    part: "Teil 2",
    enPart: "Part 2",
    client: "Teilnehmer 2",
    duration: "ca. 33 Min.",
    fileBase: "08_Einzelsitzung_Geldmangel_Teil_2",
    deTitle: "Einzelsitzung: Geldmangel – Teil 2",
    enTitle: "Individual Session: Money Scarcity – Part 2",
    deSummaryFile: "../08_Einzelsitzung_Geldmangel_Teil_2_Summary",
    enSummaryFile: "../08_Einzelsitzung_Geldmangel_Teil_2_Summary"
  },
  {
    num: "09",
    part: "Teil 3",
    enPart: "Part 3",
    client: "Teilnehmerin 3",
    duration: "ca. 41 Min.",
    fileBase: "09_Einzelsitzung_Geldmangel_Teil_3",
    deTitle: "Einzelsitzung: Geldmangel – Teil 3",
    enTitle: "Individual Session: Money Scarcity – Part 3",
    deSummaryFile: "../09_Einzelsitzung_Geldmangel_Teil_3_Summary",
    enSummaryFile: "../09_Einzelsitzung_Geldmangel_Teil_3_Summary"
  }
];

for (const s of sessions) {
  const txtPath = path.join(downloadDir, `${s.fileBase}.wav.txt`);
  if (!fs.existsSync(txtPath)) {
    console.log(`Waiting for ${txtPath}...`);
    continue;
  }

  const rawText = fs.readFileSync(txtPath, 'utf8');
  const cleaned = cleanTranscript(rawText);

  const deVollContent = `# ${s.deTitle} (Volltranskript)

> 📋 **Zusammenfassung:** [Zur strukturierten Zusammenfassung dieser Sitzung](${s.deSummaryFile})  
> **Dauer:** ${s.duration}  
> **Thema:** Geldmangel, Bindungsmuster & Aufdecken der Projektion im Kontakt  

---

${cleaned}
`;

  const enVollContent = `# ${s.enTitle} (Full Transcript)

> 📋 **Summary:** [To the structured summary of this session](${s.enSummaryFile})  
> **Duration:** ${s.duration}  
> **Language:** German (Original Audio Recording)  

---

${cleaned}
`;

  fs.writeFileSync(path.join(deVollDir, `${s.fileBase}_Volltranskript.md`), deVollContent);
  fs.writeFileSync(path.join(enVollDir, `${s.fileBase}_Volltranskript.md`), enVollContent);
  console.log(`Created Volltranskript for ${s.fileBase}`);
}
