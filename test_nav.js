const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const contentDir = path.join(process.cwd(), 'src', 'content');

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

function cleanTitle(str) {
  return str.replace(/^\d+_/, '').replace(/_/g, ' ');
}

const files = getFilePaths(contentDir);
const allContent = files.map(file => {
  const relPath = path.relative(contentDir, file);
  const parts = relPath.split(path.sep);
  const lang = parts[0];
  const slugParts = parts.slice(1).map(p => p.replace('.md', '').normalize('NFC'));
  
  const fileContents = fs.readFileSync(file, 'utf8');
  const { data, content } = matter(fileContents);
  
  let title = slugParts[slugParts.length - 1].replace(/_/g, ' ');
  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match) {
    title = h1Match[1].trim();
  } else if (data.title) {
    title = data.title;
  }
  
  return { lang, slug: slugParts, title };
});

const deContent = allContent.filter(c => c.lang === 'de');
const root = [];

deContent.forEach(item => {
  let currentLevel = root;
  for (let i = 0; i < item.slug.length; i++) {
    const part = item.slug[i];
    const isLeaf = i === item.slug.length - 1;
    
    let existingNode = currentLevel.find(n => 
      (isLeaf && n.slug && n.slug.join('/') === item.slug.join('/')) ||
      (!isLeaf && n.title === cleanTitle(part) && !n.slug)
    );

    if (!existingNode) {
      existingNode = {
        title: isLeaf ? item.title : cleanTitle(part),
        originalName: part,
        ...(isLeaf ? { slug: item.slug } : { children: [] })
      };
      currentLevel.push(existingNode);
    }

    if (!isLeaf) {
      if (!existingNode.children) {
        existingNode.children = [];
      }
      currentLevel = existingNode.children;
    }
  }
});

console.log(JSON.stringify(root.map(r => ({title: r.title, children: r.children?.length})), null, 2));
