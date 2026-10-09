const fs = require('fs');

const data = JSON.parse(fs.readFileSync('gopal_api_responses_latest.json', 'utf8'));
const topicsToFind = ['TdtXNps6', 'VpMTN1j6', 'QV6fPkD2', 'Wrsjf8Qz'];
const results = {};

function traverse(obj) {
  if (Array.isArray(obj)) {
    obj.forEach(traverse);
  } else if (obj && typeof obj === 'object') {
    if (topicsToFind.includes(obj.sid)) {
       // We found a topic. Let's find lessons inside it.
       const lessons = [];
       // Lessons are usually inside "elements" or "nodes" or "modules"
       function findLessons(o) {
          if (Array.isArray(o)) o.forEach(findLessons);
          else if (o && typeof o === 'object') {
             if ((o.type === 'lesson' || o.__typename === 'Lesson') && o.sid) {
                lessons.push({ sid: o.sid, name: o.name });
             } else if (o.type === 'step' || o.__typename === 'Step') {
                lessons.push({ sid: o.sid, name: o.name, type: 'step' });
             }
             for (const k of Object.keys(o)) findLessons(o[k]);
          }
       }
       findLessons(obj);
       results[obj.name] = lessons;
    }
    for (const key of Object.keys(obj)) traverse(obj[key]);
  }
}

for (const res of data) {
  if (res.body && res.body.data) traverse(res.body.data);
}

// deduplicate
for (const k of Object.keys(results)) {
  const unique = [];
  const seen = new Set();
  for (const l of results[k]) {
     if (!seen.has(l.sid)) {
       seen.add(l.sid);
       unique.push(l);
     }
  }
  results[k] = unique;
}

console.log(JSON.stringify(results, null, 2));
