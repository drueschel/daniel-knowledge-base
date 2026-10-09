const { execSync } = require('child_process');
const fs = require('fs');

const inDir = 'tmp_downloads/gopal';
const outDir = 'tmp_transcripts/gopal';

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const files = fs.readdirSync(inDir).filter(f => f.endsWith('.wav'));
for (const file of files) {
  const inFile = `${inDir}/${file}`;
  const outBase = file.replace('.wav', '');
  
  if (fs.existsSync(`${outDir}/${outBase}.txt`)) {
    console.log(`Skipping ${file} - transcript exists.`);
    continue;
  }
  
  console.log(`Transcribing ${file}...`);
  try {
    // Note: Gopal content is in German (-l de)
    execSync(`whisper-cli -m "/Users/danielrueschel/.cache/whisper/ggml-small.bin" -f "${inFile}" -l de -osrt -otxt -of "${outDir}/${outBase}"`, { stdio: 'inherit' });
  } catch(e) {
    console.error(`Error transcribing ${file}:`, e.message);
  }
}
console.log("Transcription done!");
