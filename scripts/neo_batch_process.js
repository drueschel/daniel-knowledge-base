const fs = require('fs');
const { spawnSync } = require('child_process');
const path = require('path');

const COURSE_JSON_PATH = path.join(__dirname, 'course_structure.json');
const OUT_DIR = path.join(__dirname, '..', 'tmp_transcripts');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const data = JSON.parse(fs.readFileSync(COURSE_JSON_PATH, 'utf8'));

// Filter only coursework items that actually have content
const lessons = data.filter(d => d.post_type === 'coursework').slice(9, 18);

console.log(`Found ${lessons.length} lessons to process.`);

// Process sequentially
for (let i = 0; i < lessons.length; i++) {
  const lesson = lessons[i];
  const slug = lesson.slug;
  // Create a safe filename (e.g., 001_somatic-evolution-course-overview)
  const indexStr = String(i + 1).padStart(3, '0');
  const filenamePrefix = `${indexStr}_${slug.substring(0, 50)}`; 
  
  const tsFile = path.join(OUT_DIR, `${filenamePrefix}.ts`);
  const txtFile = path.join(OUT_DIR, `${filenamePrefix}.txt`);
  const url = `https://members.emotionalreleases.com/posts/${slug}`;

  console.log(`\n==================================================`);
  console.log(`[${i+1}/${lessons.length}] Processing: ${lesson.title}`);
  console.log(`URL: ${url}`);
  console.log(`==================================================`);

  if (fs.existsSync(txtFile)) {
    console.log(`Transcript ${txtFile} already exists, skipping.`);
    continue;
  }

  if (!fs.existsSync(tsFile)) {
    console.log(`Downloading video to ${tsFile}...`);
    // Need to use npm root -g for NODE_PATH if using global playwright
    const env = Object.assign({}, process.env);
    
    const downloadRes = spawnSync('node', ['scripts/neo_download_video.js', url, tsFile], {
      stdio: 'inherit',
      env
    });
    
    if (downloadRes.status !== 0) {
      console.log(`Download failed for ${url} (Exit code ${downloadRes.status})`);
      // It might not be a video lesson (e.g. text only), skip to next
      continue;
    }
  }

  if (fs.existsSync(tsFile)) {
    console.log(`Transcribing ${tsFile}...`);
    const transcribeRes = spawnSync('node', ['scripts/neo_transcribe.js', tsFile, OUT_DIR], {
      stdio: 'inherit'
    });
    
    if (transcribeRes.status === 0 && fs.existsSync(txtFile)) {
      console.log(`Transcription successful. Cleaning up ${tsFile}...`);
      fs.unlinkSync(tsFile);
    } else {
      console.log(`Transcription failed for ${tsFile}`);
    }
  }
}

console.log('Batch processing complete.');
