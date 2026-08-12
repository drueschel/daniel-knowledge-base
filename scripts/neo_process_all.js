const fs = require('fs');
const { spawnSync } = require('child_process');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...val] = line.split('=');
    if (key && val.length > 0) {
      process.env[key.trim()] = val.join('=').trim();
    }
  });
}

// Hardcoded translations to avoid needing an API key for the folder generation
const translationMap = {
  "Course Overview": "Kurs Uebersicht",
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

const COURSE_JSON_PATH = path.join(__dirname, 'course_structure.json');
const OUT_DIR = path.join(__dirname, '..', 'tmp_transcripts');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const data = JSON.parse(fs.readFileSync(COURSE_JSON_PATH, 'utf8'));
const coursework = data.filter(d => d.post_type === 'coursework');

async function translateTitle(title) {
  return translationMap[title] || title; // fallback to english if not found
}

function sanitizeDirName(name) {
  return name.replace(/[^a-zA-Z0-9äöüÄÖÜß]/g, '_').replace(/_+/g, '_').replace(/_$/, '');
}

async function run() {
  let moduleCount = 1; // Course Overview is 1
  let lessonCount = 0;

  // We hardcode the first module name because it doesn't have prompt_type='course_section'
  let currentEnModuleDir = '1_Course_Overview';
  let currentDeModuleDir = '1_Kurs_Uebersicht';

  for (let i = 0; i < coursework.length; i++) {
    const item = coursework[i];
    
    if (i === 0) {
      console.log(`\n\n=== MODULE 1: Course Overview ===`);
      continue;
    }

    if (item.prompt_type === 'course_section') {
      moduleCount++;
      lessonCount = 0;

      const enTitle = item.title;
      const deTitle = await translateTitle(enTitle);

      currentEnModuleDir = `${moduleCount}_${sanitizeDirName(enTitle)}`;
      currentDeModuleDir = `${moduleCount}_${sanitizeDirName(deTitle)}`;

      console.log(`\n\n=== MODULE ${moduleCount}: ${enTitle} ===`);
      continue;
    }

    // It's a lesson
    lessonCount++;
    const slug = item.slug || sanitizeDirName(item.title);
    
    // Auto-translate lesson title for DE filename
    const enLessonTitle = item.title;
    const deLessonTitle = await translateTitle(enLessonTitle);

    const indexStr = String(lessonCount).padStart(2, '0');
    
    const enFilename = `${indexStr}_${sanitizeDirName(enLessonTitle)}.md`;
    const deFilename = `${indexStr}_${sanitizeDirName(deLessonTitle)}.md`;

    // Paths
    const enOutPath = path.join(__dirname, '..', 'src', 'content', 'en', '4_Neo_Emotional_Release', currentEnModuleDir, enFilename);
    const deOutPath = path.join(__dirname, '..', 'src', 'content', 'de', '4_Neo_Emotional_Release', currentDeModuleDir, deFilename);

    if (fs.existsSync(enOutPath) && fs.existsSync(deOutPath)) {
      console.log(`[SKIP] ${enOutPath} already exists.`);
      continue;
    }

    const tmpFilenamePrefix = `${moduleCount}_${indexStr}_${slug.substring(0, 50)}`; 
    const tsFile = path.join(OUT_DIR, `${tmpFilenamePrefix}.ts`);
    const txtFile = path.join(OUT_DIR, `${tmpFilenamePrefix}.txt`);
    const url = `https://members.emotionalreleases.com/posts/${slug}`;

    console.log(`\n--- [Mod ${moduleCount} | Les ${lessonCount}] Processing: ${enLessonTitle} ---`);
    console.log(`URL: ${url}`);

    if (!fs.existsSync(txtFile)) {
      if (!fs.existsSync(tsFile)) {
        console.log(`Downloading video...`);
        // TRY HEADLESS FIRST, fallback to headed if it fails
        const env = Object.assign({}, process.env, { PLAYWRIGHT_HEADLESS: 'true' });
        
        let downloadRes = spawnSync('node', ['scripts/neo_download_video.js', url, tsFile], {
          stdio: 'inherit',
          env
        });

        if (downloadRes.status !== 0) {
          console.log(`Headless download failed, retrying in Headed mode...`);
          const envHeaded = Object.assign({}, process.env, { PLAYWRIGHT_HEADLESS: 'false' });
          downloadRes = spawnSync('node', ['scripts/neo_download_video.js', url, tsFile], {
            stdio: 'inherit',
            env: envHeaded
          });
        }
        
        if (downloadRes.status !== 0) {
          console.log(`Download completely failed for ${url}. Skipping.`);
          continue;
        }
      }

      console.log(`Transcribing...`);
      const transcribeRes = spawnSync('node', ['scripts/neo_transcribe.js', tsFile, OUT_DIR], {
        stdio: 'inherit'
      });
      
      if (transcribeRes.status === 0 && fs.existsSync(txtFile)) {
        console.log(`Transcription successful. Cleaning up ${tsFile}...`);
        fs.unlinkSync(tsFile);
      } else {
        console.log(`Transcription failed.`);
        continue;
      }
    }

    // console.log(`Generating AI Summaries...`);
    // const summarizeRes = spawnSync('node', ['scripts/neo_generate_summary.js', txtFile, deOutPath, enOutPath], {
    //   stdio: 'inherit',
    //   env: process.env
    // });
    // 
    // if (summarizeRes.status !== 0) {
    //   console.log(`Summarization failed.`);
    // } else {
    //   console.log(`Lesson fully processed!`);
    // }
    console.log(`Lesson transcript downloaded and extracted to ${txtFile}. Summarization skipped for batch processing later.`);
  }
}

run().catch(console.error);
