const fs = require('fs');
const path = require('path');

const translationMap = {
  // Week 7
  "Definement | Theory and Examples of Application | Mathias": "Definement | Theorie und Anwendungsbeispiele | Mathias",
  "Week 7 Practice Room | Definement": "Woche 7 Praxisraum | Definement",
  "Guided Exercise | Definement journey": "Geführte Übung | Definement Reise",
  "Week 7 Demo | Definement": "Woche 7 Demo | Definement",
  
  // Week 8
  "Psychosomatics | The Significance of Fascia": "Psychosomatik | Die Bedeutung der Faszien",
  "Demo | Intense Release through Definement": "Demo | Intensives Release durch Definement",
  "Demo | From Sensation to Story": "Demo | Von der Empfindung zur Geschichte",
  "Psychosomatics Deep Dive | The Psychosomatic Code (2hours 20mins)": "Psychosomatik Deep Dive | Der Psychosomatische Code (2 Stunden 20 Minuten)",
  " Week 8 Practice Room | Definement II (30 MINS)": "Woche 8 Praxisraum | Definement II (30 Minuten)",
  "Week 8 Practice Room | Definement II (30 MINS)": "Woche 8 Praxisraum | Definement II (30 Minuten)",
  
  // Week 9
  "Conversions | The Symbolic Language of the Body | David": "Conversions | Die symbolische Sprache des Körpers | David",
  "How to use Conversions | Lukas": "Wie man Conversions nutzt | Lukas",
  "Phantom Dialogue Demo | David": "Phantom Dialog Demo | David",
  "Phantom Dialogue Demo | Analizing Techniques | David": "Phantom Dialog Demo | Techniken analysieren | David",
  " Week 9 Practice Room | Phantom Dialogue": "Woche 9 Praxisraum | Phantom Dialog",
  "Week 9 Practice Room | Phantom Dialogue": "Woche 9 Praxisraum | Phantom Dialog",
  
  // Week 10
  "Intro Into Parts Work / IFS | Lukas": "Einführung in die Teilearbeit / IFS | Lukas",
  "What are Parts? | Lukas": "Was sind Teile? | Lukas",
  " Week 10 Practice Room | Parts Work 1": "Woche 10 Praxisraum | Teilearbeit 1",
  "Week 10 Practice Room | Parts Work 1": "Woche 10 Praxisraum | Teilearbeit 1",
  
  // Week 11
  "What Are Protectors? | Lukas": "Was sind Beschützer? | Lukas",
  "What Are Exiles? | Lukas": "Was sind Verbannte? | Lukas",
  "Guided excercice | Parts exploration | Mathias": "Geführte Übung | Erkundung der Teile | Mathias",
  " Week 11 Practice Room | Parts Work 2": "Woche 11 Praxisraum | Teilearbeit 2",
  "Week 11 Practice Room | Parts Work 2": "Woche 11 Praxisraum | Teilearbeit 2",
  
  // Week 12
  " Week 12 Practice Room | Free Conversions": "Woche 12 Praxisraum | Free Conversions",
  "Week 12 Practice Room | Free Conversions": "Woche 12 Praxisraum | Free Conversions"
};

function getFilePaths(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFilePaths(fullPath));
    } else if (file.endsWith('.md')) {
      results.push(fullPath);
    }
  }
  return results;
}

const deDir = path.join(__dirname, '../src/content/de/4_Neo_Emotional_Release');
const files = getFilePaths(deDir);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match) {
    const originalTitle = h1Match[1].trim();
    if (translationMap[originalTitle]) {
      const translatedTitle = translationMap[originalTitle];
      content = content.replace(/^#\s+.+$/m, `# ${translatedTitle}`);
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Translated: ${originalTitle} -> ${translatedTitle}`);
    }
  }
});
