import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentDir = path.join(process.cwd(), 'src', 'content');

export interface MarkdownFile {
  slug: string[];
  lang: string;
  content: string;
  data: { [key: string]: any };
  title: string;
}

export function getFilePaths(dir: string): string[] {
  let results: string[] = [];
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

export function getAllContent(): MarkdownFile[] {
  if (!fs.existsSync(contentDir)) return [];
  
  const files = getFilePaths(contentDir);
  return files.map(file => {
    const relPath = path.relative(contentDir, file);
    const parts = relPath.split(path.sep);
    const lang = parts[0];
    const slugParts = parts.slice(1).map(p => p.replace('.md', ''));
    
    const fileContents = fs.readFileSync(file, 'utf8');
    const { data, content } = matter(fileContents);
    
    // Extract title from first H1 or filename
    let title = slugParts[slugParts.length - 1].replace(/_/g, ' ');
    const h1Match = content.match(/^#\s+(.+)$/m);
    if (h1Match) {
      title = h1Match[1].trim();
    } else if (data.title) {
      title = data.title;
    }
    
    return {
      lang,
      slug: slugParts,
      content,
      data,
      title
    };
  });
}

export function getContentBySlug(lang: string, slug: string[]): MarkdownFile | null {
  const allContent = getAllContent();
  return allContent.find(c => c.lang === lang && c.slug.join('/') === slug.join('/')) || null;
}

export interface NavItem {
  title: string;
  slug?: string[];
  children?: NavItem[];
}

function cleanTitle(str: string): string {
  // Remove leading numbers and underscores (e.g., "1_Die_Befreiung" -> "Die Befreiung")
  return str.replace(/^\d+_/, '').replace(/_/g, ' ');
}

export function getSidebarNavigation(lang: string): NavItem[] {
  const allContent = getAllContent().filter(c => c.lang === lang);
  
  const root: NavItem[] = [];

  allContent.forEach(item => {
    let currentLevel = root;
    
    // Traverse the slug parts to build the tree
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
  
  // Sort children alphabetically (or keep original sorting by numbers if we sort by original part name? 
  // Wait, let's sort by title if they have one, but we removed the numbers from the title.
  // The user had numbers like 1_, 2_ for order.
  // Actually, let's sort the root level nodes manually if we can, or just sort them alphabetically by title.
  // Or better, let's sort by the original folder names if we can.
  // We'll leave it as they were processed, but they are processed in fs.readdirSync order which is alphabetical, so `1_`, `2_` are sorted correctly!
  
  return root;
}
