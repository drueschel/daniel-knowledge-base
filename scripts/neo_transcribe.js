const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const inputFile = process.argv[2];
const outputDir = process.argv[3];
const modelPath = '/Users/danielrueschel/.cache/whisper/ggml-small.bin';

if (!inputFile || !outputDir) {
  console.log('Usage: node neo_transcribe.js <input-video> <output-dir>');
  process.exit(1);
}

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

(async () => {
  console.log(`🎙️ Starte Transkription für: ${inputFile}`);

  if (!fs.existsSync(modelPath)) {
    console.error('❌ Whisper Model `ggml-small.bin` noch nicht gefunden.');
    process.exit(1);
  }

  const baseName = path.basename(inputFile, path.extname(inputFile));
  const wavPath = path.join(outputDir, `${baseName}_16k.wav`);
  const outTxtPath = path.join(outputDir, `${baseName}.txt`);
  const outMdPath = path.join(outputDir, `${baseName}.md`);

  try {
    console.log('  1. Konvertiere Audio in 16kHz WAV...');
    execSync(`ffmpeg -y -i "${inputFile}" -ar 16000 -ac 1 -c:a pcm_s16le "${wavPath}"`, { stdio: 'ignore' });

    console.log('  2. Führe Whisper-Transkription (Englisch) aus...');
    // Neo Emotional Release is in English, so we use -l en
    const whisperCmd = `whisper-cli -m "${modelPath}" -l en -f "${wavPath}" --output-txt --output-file "${path.join(outputDir, baseName)}"`;
    execSync(whisperCmd, { stdio: 'inherit' });

    if (fs.existsSync(wavPath)) fs.unlinkSync(wavPath);

    if (fs.existsSync(outTxtPath)) {
      const rawText = fs.readFileSync(outTxtPath, 'utf8').trim();
      const mdContent = `# Transkript: ${baseName.replace(/_/g, ' ')}\n\n**Datei:** \`${path.basename(inputFile)}\`  \n**Sprache:** Englisch  \n\n---\n\n## Inhalt:\n\n${rawText}\n`;
      fs.writeFileSync(outMdPath, mdContent);
      console.log(`✅ TRANSKRIPT GESPEICHERT:\n   📄 ${outMdPath}\n   📝 ${outTxtPath}`);
    }
  } catch (err) {
    console.error(`❌ Fehler bei Transkription von ${inputFile}:`, err.message);
  }
})();
