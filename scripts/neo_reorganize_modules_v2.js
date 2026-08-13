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

// Simple Levenshtein distance for fuzzy matching
function levenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) == a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
      }
    }
  }
  return matrix[b.length][a.length];
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
      deTitle: translateTitle(item.title),
      slug: item.slug
    });
  }
}

function findMarkdownFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(findMarkdownFiles(filePath));
    } else if (file.endsWith('.md') && !file.toLowerCase().includes('quiz')) {
      results.push(filePath);
    }
  }
  return results;
}

const deDir = path.join(__dirname, '../src/content/de/4_Neo_Emotional_Release');
const enDir = path.join(__dirname, '../src/content/en/4_Neo_Emotional_Release');
const existingDeFiles = findMarkdownFiles(deDir);
const existingEnFiles = findMarkdownFiles(enDir);

const newDeDir = path.join(__dirname, '../src/content/de/4_Neo_Emotional_Release_NEW');
const newEnDir = path.join(__dirname, '../src/content/en/4_Neo_Emotional_Release_NEW');

function moveFilesToNewStructure(existingFiles, isDe) {
  for (const file of existingFiles) {
    const filename = path.basename(file);
    const existingNameWithoutNumbers = filename.replace(/^\d+_/, '').replace(/\.md$/, '').toLowerCase();
    
    let bestMatch = null;
    let minDistance = Infinity;

    for (const section of trueStructure) {
      for (const lesson of section.lessons) {
        const title = isDe ? lesson.deTitle : lesson.enTitle;
        const sanitizedTitle = sanitizeDirName(title).toLowerCase();
        
        const dist = levenshteinDistance(existingNameWithoutNumbers, sanitizedTitle);
        // Also check english fallback for DE files if they weren't translated properly originally
        const distEn = isDe ? levenshteinDistance(existingNameWithoutNumbers, sanitizeDirName(lesson.enTitle).toLowerCase()) : Infinity;
        
        const bestDist = Math.min(dist, distEn);

        if (bestDist < minDistance) {
          minDistance = bestDist;
          bestMatch = { section, lesson, title };
        }
      }
    }

    if (bestMatch && minDistance < 20) { // arbitrary threshold to avoid bad matches
      const { section, lesson, title } = bestMatch;
      const expectedFilename = `${String(lesson.index).padStart(2, '0')}_${sanitizeDirName(title)}.md`;
      const sectionPrefix = String(section.index).padStart(2, '0');
      const sectionTitle = isDe ? section.deTitle : section.enTitle;
      const sectionDirName = `${sectionPrefix}_${sanitizeDirName(sectionTitle)}`;
      
      const targetDir = path.join(isDe ? newDeDir : newEnDir, sectionDirName);
      fs.mkdirSync(targetDir, { recursive: true });
      
      const targetPath = path.join(targetDir, expectedFilename);
      // only copy if it doesn't already exist (we ran previous script, so some files are already there)
      if (!fs.existsSync(targetPath)) {
        fs.copyFileSync(file, targetPath);
        console.log(`Fuzzy matched ${filename} -> ${targetDir}/${expectedFilename} (dist: ${minDistance})`);
      }
    } else {
      console.log(`WARNING: Could not fuzzy match ${filename} (Best dist: ${minDistance})`);
    }
  }
}

moveFilesToNewStructure(existingDeFiles, true);
moveFilesToNewStructure(existingEnFiles, false);
console.log("Done generating new structure in *_NEW folders.");
