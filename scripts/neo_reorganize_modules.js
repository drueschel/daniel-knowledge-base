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

// 1. Build the true structure
const trueStructure = [];
let currentSection = null;
let sectionCount = 0;
let lessonCount = 0;

for (const item of data) {
  if (item.prompt_type === 'course_overview') {
    continue; // Ignore completely as per user requirements
  }
  
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

// 2. Scan existing files in DE and EN
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
fs.mkdirSync(newDeDir, { recursive: true });
fs.mkdirSync(newEnDir, { recursive: true });

function moveFilesToNewStructure(existingFiles, isDe) {
  for (const file of existingFiles) {
    const filename = path.basename(file);
    // Find this lesson in the true structure
    // Filename looks like: "01_Willkommen_bei_Somatic_Evolution.md"
    let matched = false;
    for (const section of trueStructure) {
      for (const lesson of section.lessons) {
        const title = isDe ? lesson.deTitle : lesson.enTitle;
        const expectedFilename = `${String(lesson.index).padStart(2, '0')}_${sanitizeDirName(title)}.md`;
        
        // Also check if the existing filename matches the expected filename
        // Sometimes the existing file was generated with a slightly different index because of Course Overview
        // So let's match by sanitized title!
        const sanitizedTitle = sanitizeDirName(title);
        
        // Exclude the prefix numbers from the existing filename to match just the title part
        const existingNameWithoutNumbers = filename.replace(/^\d+_/, '').replace(/\.md$/, '');
        
        if (existingNameWithoutNumbers === sanitizedTitle) {
          // Found it!
          const sectionPrefix = String(section.index).padStart(2, '0');
          const sectionTitle = isDe ? section.deTitle : section.enTitle;
          const sectionDirName = `${sectionPrefix}_${sanitizeDirName(sectionTitle)}`;
          
          const targetDir = path.join(isDe ? newDeDir : newEnDir, sectionDirName);
          fs.mkdirSync(targetDir, { recursive: true });
          
          const targetPath = path.join(targetDir, expectedFilename);
          fs.copyFileSync(file, targetPath);
          console.log(`Copied ${filename} to ${targetDir}`);
          matched = true;
          break;
        }
      }
      if (matched) break;
    }
    if (!matched) {
      console.log(`WARNING: Could not find a match for ${filename}`);
    }
  }
}

moveFilesToNewStructure(existingDeFiles, true);
moveFilesToNewStructure(existingEnFiles, false);
console.log("Done generating new structure in *_NEW folders.");
