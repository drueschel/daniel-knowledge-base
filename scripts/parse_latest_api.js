const fs = require('fs');

const data = JSON.parse(fs.readFileSync('gopal_api_responses_latest.json', 'utf8'));

const modules = [];

for (const res of data) {
  if (res.body && res.body.data) {
     const str = JSON.stringify(res.body.data);
     if (str.includes('Depression') || str.includes('Trigger') || str.includes('13')) {
        // Find course nodes
        function traverse(obj) {
           if (Array.isArray(obj)) {
              obj.forEach(traverse);
           } else if (obj && typeof obj === 'object') {
              if (obj.type === 'COURSE_MODULE' || obj.__typename === 'CourseModule') {
                 modules.push({ id: obj.id, title: obj.title });
              }
              if (obj.elements) traverse(obj.elements);
              if (obj.modules) traverse(obj.modules);
              if (obj.nodes) traverse(obj.nodes);
              if (obj.edges) traverse(obj.edges);
              if (obj.node) traverse(obj.node);
           }
        }
        traverse(res.body.data);
     }
  }
}

// deduplicate
const unique = [];
const seen = new Set();
for (const m of modules) {
  if (m.title && !seen.has(m.id)) {
     seen.add(m.id);
     unique.push(m);
  }
}

console.log(JSON.stringify(unique, null, 2));
