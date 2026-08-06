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

export function getSidebarNavigation(lang: string) {
  const allContent = getAllContent().filter(c => c.lang === lang);
  
  // Group by category (first part of slug if it has multiple parts)
  const nav: Record<string, MarkdownFile[]> = {
    'Main': []
  };
  
  allContent.forEach(item => {
    if (item.slug.length === 1) {
      nav['Main'].push(item);
    } else {
      const category = item.slug[0].replace(/_/g, ' ');
      if (!nav[category]) nav[category] = [];
      nav[category].push(item);
    }
  });
  
  return nav;
}
