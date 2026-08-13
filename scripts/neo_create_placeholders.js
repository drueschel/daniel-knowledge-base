const fs = require('fs');
const path = require('path');

const COURSE_JSON_PATH = path.join(__dirname, 'course_structure.json');
const data = JSON.parse(fs.readFileSync(COURSE_JSON_PATH, 'utf8'));

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

function translateTitle(title) {
  return translationMap[title] || title;
}

function sanitizeDirName(name) {
  return name.replace(/[^a-zA-Z0-9äöüÄÖÜß]/g, '_').replace(/_+/g, '_').replace(/_$/, '');
}

const trueStructure = [];
let currentSection = null;
let sectionCount = 0;
let lessonCount = 0;

for (const item of data) {
  if (item.prompt_type === 'course_overview') continue;
  
  if (item.prompt_type === 'course_section') {
    sectionCount++;
    lessonCount = 0;
    currentSection = {
      index: sectionCount,
      enTitle: item.title,
      deTitle: translateTitle(item.title),
      lessons: []
    };
    trueStructure.push(currentSection);
    continue;
  }
  
  if (item.post_type === 'coursework' && currentSection && !item.title.toLowerCase().includes('quiz')) {
    lessonCount++;
    currentSection.lessons.push({
      index: lessonCount,
      enTitle: item.title,
      deTitle: translateTitle(item.title)
    });
  }
}

const deDir = path.join(__dirname, '../src/content/de/4_Neo_Emotional_Release');
const enDir = path.join(__dirname, '../src/content/en/4_Neo_Emotional_Release');

function createPlaceholders() {
  for (const section of trueStructure) {
    const sectionPrefix = String(section.index).padStart(2, '0');
    
    // DE Dir
    const deSectionTitle = section.deTitle;
    const deSectionDirName = `${sectionPrefix}_${sanitizeDirName(deSectionTitle)}`;
    const deTargetDir = path.join(deDir, deSectionDirName);
    if (!fs.existsSync(deTargetDir)) fs.mkdirSync(deTargetDir, { recursive: true });

    // EN Dir
    const enSectionTitle = section.enTitle;
    const enSectionDirName = `${sectionPrefix}_${sanitizeDirName(enSectionTitle)}`;
    const enTargetDir = path.join(enDir, enSectionDirName);
    if (!fs.existsSync(enTargetDir)) fs.mkdirSync(enTargetDir, { recursive: true });

    for (const lesson of section.lessons) {
      const lessonPrefix = String(lesson.index).padStart(2, '0');
      
      // DE File
      const deLessonFilename = `${lessonPrefix}_${sanitizeDirName(lesson.deTitle)}.md`;
      const deTargetPath = path.join(deTargetDir, deLessonFilename);
      
      if (!fs.existsSync(deTargetPath)) {
        console.log(`Creating placeholder: ${deTargetPath}`);
        fs.writeFileSync(deTargetPath, `# ${lesson.deTitle}\n\n*Diese Zusammenfassung wird bald hinzugefügt.*`, 'utf8');
      }

      // EN File
      const enLessonFilename = `${lessonPrefix}_${sanitizeDirName(lesson.enTitle)}.md`;
      const enTargetPath = path.join(enTargetDir, enLessonFilename);
      
      if (!fs.existsSync(enTargetPath)) {
        console.log(`Creating placeholder: ${enTargetPath}`);
        fs.writeFileSync(enTargetPath, `# ${lesson.enTitle}\n\n*This summary will be added soon.*`, 'utf8');
      }
    }
  }
}

createPlaceholders();
console.log("Placeholders created successfully!");
