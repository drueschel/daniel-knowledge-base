const fs = require('fs');
const path = require('path');

const deFiles = fs.readFileSync('missing_de_files.txt', 'utf8').trim().split('\n');

const subagents = deFiles.map(deFile => {
  const relPath = path.relative(path.join(__dirname, '..', 'src', 'content', 'de', '4_Neo_Emotional_Release'), deFile);
  const pathParts = relPath.split('/');
  const moduleDirDe = pathParts[0];
  const filename = pathParts[1];
  
  // Find EN module dir (assuming they have the same prefix like "19_...")
  const prefix = moduleDirDe.split('_')[0];
  const enDirs = fs.readdirSync(path.join(__dirname, '..', 'src', 'content', 'en', '4_Neo_Emotional_Release'));
  const moduleDirEn = enDirs.find(d => d.startsWith(prefix + '_'));
  
  const enFile = path.join(__dirname, '..', 'src', 'content', 'en', '4_Neo_Emotional_Release', moduleDirEn, filename);
  
  // Find transcript
  const lessonPrefix = filename.split('_')[0];
  const txtPrefix = `${parseInt(prefix)}_${lessonPrefix}_`;
  const txtDir = path.join(__dirname, '..', 'tmp_transcripts');
  let txtFile = null;
  if (fs.existsSync(txtDir)) {
    const txts = fs.readdirSync(txtDir);
    const txtName = txts.find(f => f.startsWith(txtPrefix) && f.endsWith('.txt'));
    if (txtName) txtFile = path.join(txtDir, txtName);
  }
  
  return {
    TypeName: "transcript_summarizer",
    Role: "Summarizer for " + filename,
    Prompt: `Summarize the transcript at:\n${txtFile}\n\nAnd save the German summary to:\n${deFile}\n\nAnd the English summary to:\n${enFile}\n\nBe sure to read the target files first to grab the correct H1 title. If no transcript file is found, just reply "DONE: [transcript not found]"`
  };
});

fs.writeFileSync('subagents_batch.json', JSON.stringify(subagents, null, 2));
