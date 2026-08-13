const fs = require('fs');
const path = require('path');

const COURSE_JSON_PATH = path.join(__dirname, 'course_structure.json');
const OUT_DIR = path.join(__dirname, '..', 'tmp_transcripts');
const data = JSON.parse(fs.readFileSync(COURSE_JSON_PATH, 'utf8'));
const coursework = data.filter(d => d.post_type === 'coursework');

const translationMap = {
  "WELCOME TO SOMATIC EVOLUTION": "Willkommen bei Somatic Evolution",
  "Introduction into Neo Emotional Release": "Einfuehrung in Neo Emotional Release",
  "Introduction Into Emotions": "Einfuehrung in Emotionen",
  "Guided Meditations": "Gefuehrte Meditationen",
  "WEEK 1 Theory | Logging In": "WOCHE 1 Theorie | Logging In",
  "WEEK 1 Practice | Logging in": "WOCHE 1 Praxis | Logging In",
  "WEEK 2 Theory | Somatic Integration": "WOCHE 2 Theorie | Somatic Integration",
  "WEEK 2 Practice | Somatic Integration": "WOCHE 2 Praxis | Somatic Integration",
  "WEEK 3 Theory | Equalising": "WOCHE 3 Theorie | Equalising",
  "WEEK 3 Practice | Equalising": "WOCHE 3 Praxis | Equalising",
  "WEEK 4 Theory | Breath": "WOCHE 4 Theorie | Atem",
  "WEEK 4 Practice | Breath": "WOCHE 4 Praxis | Atem",
  "WEEK 5 Theory | Resourcing": "WOCHE 5 Theorie | Resourcing",
  "WEEK 5 Practice | Resourcing": "WOCHE 5 Praxis | Resourcing",
  "WEEK 6 Theory | Resourcing II": "WOCHE 6 Theorie | Resourcing II",
  "WEEK 6 Practice | Resourcing II": "WOCHE 6 Praxis | Resourcing II",
  "WEEK 7 Theory | Definement": "WOCHE 7 Theorie | Definement",
  "WEEK 7 Practice | Definement": "WOCHE 7 Praxis | Definement",
  "WEEK 8 Theory | Definement II": "WOCHE 8 Theorie | Definement II",
  "WEEK 8 Practice | Definement II": "WOCHE 8 Praxis | Definement II",
  "WEEK 9 Theory | Conversions": "WOCHE 9 Theorie | Conversions",
  "WEEK 9 Practice | Conversions": "WOCHE 9 Praxis | Conversions",
  "Week 10 Theory | Parts Work I": "WOCHE 10 Theorie | Parts Work I",
  "WEEK 10 Practice | Parts Work I": "WOCHE 10 Praxis | Parts Work I",
  "WEEK 11 Theory | Parts Work II": "WOCHE 11 Theorie | Parts Work II",
  "WEEK 11 Practice | Parts Work II": "WOCHE 11 Praxis | Parts Work II",
  "WEEK 12 Practice | Free Conversions": "WOCHE 12 Praxis | Free Conversions"
};

function translateTitle(title) { return translationMap[title] || title; }
function sanitizeDirName(name) { return name.replace(/[^a-zA-Z0-9äöüÄÖÜß]/g, '_').replace(/_+/g, '_').replace(/_$/, ''); }

const missing = [];
let moduleCount = 1;
let lessonCount = 0;
let currentEnModuleDir = '1_Course_Overview';
let currentDeModuleDir = '1_Kurs_Uebersicht';

for (let i = 0; i < coursework.length; i++) {
  const item = coursework[i];
  if (i === 0) continue;
  if (item.prompt_type === 'course_section') {
    moduleCount++; lessonCount = 0;
    currentEnModuleDir = `${String(moduleCount).padStart(2, '0')}_${sanitizeDirName(item.title)}`;
    currentDeModuleDir = `${String(moduleCount).padStart(2, '0')}_${sanitizeDirName(translateTitle(item.title))}`;
    continue;
  }
  lessonCount++;
  if (item.title.toLowerCase().includes('quiz')) continue;

  const slug = item.slug || sanitizeDirName(item.title);
  const indexStr = String(lessonCount).padStart(2, '0');
  
  const enFilename = `${indexStr}_${sanitizeDirName(item.title)}.md`;
  // The DE filename uses the SAME sanitize function on the SAME english title, since the translation map doesn't map lesson names for week 8-12
  const deFilename = `${indexStr}_${sanitizeDirName(item.title)}.md`;

  const deOutPath = path.join(__dirname, '..', 'src', 'content', 'de', '4_Neo_Emotional_Release', currentDeModuleDir, deFilename);
  const enOutPath = path.join(__dirname, '..', 'src', 'content', 'en', '4_Neo_Emotional_Release', currentEnModuleDir, enFilename);

  // Check if it's a placeholder
  if (fs.existsSync(deOutPath)) {
    const content = fs.readFileSync(deOutPath, 'utf8');
    if (content.includes('Diese Zusammenfassung wird bald hinzugefügt')) {
      // Find the txt file using fuzzy logic because we might have named it slightly differently in tmp_transcripts
      const prefix = `${moduleCount}_${indexStr}_`;
      let foundTxt = null;
      if (fs.existsSync(OUT_DIR)) {
        const files = fs.readdirSync(OUT_DIR);
        for (const f of files) {
          if (f.startsWith(prefix) && f.endsWith('.txt')) {
            foundTxt = path.join(OUT_DIR, f);
            break;
          }
        }
      }
      
      missing.push({ txtFile: foundTxt, deFile: deOutPath, enFile: enOutPath });
    }
  }
}

console.log(JSON.stringify(missing, null, 2));
