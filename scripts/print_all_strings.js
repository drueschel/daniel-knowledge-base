const fs = require('fs');
const data = JSON.parse(fs.readFileSync('gopal_api_responses_latest.json', 'utf8'));

const strings = new Set();

function traverse(obj) {
  if (typeof obj === 'string') {
    if (obj.length > 2 && obj.length < 60 && !obj.includes('http') && !obj.match(/^[a-zA-Z0-9_-]{20,}$/)) {
      strings.add(obj);
    }
  } else if (Array.isArray(obj)) {
    obj.forEach(traverse);
  } else if (obj && typeof obj === 'object') {
    for (const key of Object.keys(obj)) {
      traverse(obj[key]);
    }
  }
}

traverse(data);

const arr = Array.from(strings);
arr.sort();
console.log(arr.join('\n'));
