const fs = require('fs');

const data = JSON.parse(fs.readFileSync('gopal_api_responses_latest.json', 'utf8'));
const lessons = [];

function traverse(obj) {
  if (Array.isArray(obj)) {
    obj.forEach(traverse);
  } else if (obj && typeof obj === 'object') {
    if (obj.type === 'lesson' || obj.__typename === 'Lesson') {
       if (obj.name && (
           obj.name.includes('Einsamkeit') || 
           obj.name.includes('Übergewicht') || 
           obj.name.includes('Praxis') || 
           obj.name.includes('Zusammenfassung')
       )) {
         // Some objects just reference the lesson, some define it.
         // Let's grab the id and name.
         lessons.push({ id: obj.id, name: obj.name });
       }
    }
    for (const key of Object.keys(obj)) {
       if (key !== 'parent' && key !== 'course') {
         traverse(obj[key]);
       }
    }
  }
}

for (const res of data) {
  if (res.body && res.body.data) traverse(res.body.data);
}

const unique = {};
for (const l of lessons) {
  if (l.name.length < 50) unique[l.id] = l.name; // ID format: Lesson:xxx or similar
}

console.log(JSON.stringify(unique, null, 2));
