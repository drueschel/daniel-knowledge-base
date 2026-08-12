const fs = require('fs');

const payloads = JSON.parse(fs.readFileSync('scripts/api_payloads.json', 'utf8'));
const payload = JSON.parse(payloads[0]);

// Looking for sections (modules) and items (lessons)
const courseStructure = [];

// The JSON structure from MightyNetworks usually has an array of sections in `content_sections` or `items`
// We need to inspect the keys
const traverse = (obj, path = '') => {
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      traverse(obj[i], `${path}[${i}]`);
    }
  } else if (typeof obj === 'object' && obj !== null) {
    if (obj.title && obj.items && Array.isArray(obj.items)) {
      // It looks like a module!
      const module = {
        title: obj.title,
        lessons: []
      };
      
      obj.items.forEach(item => {
        if (item.title && item.url) {
          module.lessons.push({
            title: item.title,
            url: item.url.replace('https://members.emotionalreleases.com', '')
          });
        }
      });
      if (module.lessons.length > 0) {
        courseStructure.push(module);
      }
    }
    
    // Some structures use content_sections
    if (obj.collection && obj.collection.title) {
        // ... handled below
    }
    
    for (const key in obj) {
      traverse(obj[key], `${path}.${key}`);
    }
  }
};

traverse(payload);

// If simple traversal didn't work, let's just do a string based extraction for debugging
if (courseStructure.length === 0) {
    console.log("Keys in payload:", Object.keys(payload));
    fs.writeFileSync('scripts/course_structure.json', JSON.stringify(payload, null, 2));
} else {
    // Dedup modules just in case
    const uniqueModules = [];
    const seen = new Set();
    for (const m of courseStructure) {
        if (!seen.has(m.title)) {
            seen.add(m.title);
            uniqueModules.push(m);
        }
    }
    fs.writeFileSync('scripts/course_structure.json', JSON.stringify(uniqueModules, null, 2));
    console.log(`Extracted ${uniqueModules.length} modules!`);
    uniqueModules.forEach(m => console.log(`- ${m.title} (${m.lessons.length} lessons)`));
}
