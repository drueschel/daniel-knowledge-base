import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentDir = path.join(process.cwd(), 'src', 'content');

export interface MarkdownFile {
  slug: string[];
  lang: string;
  content: string;
  data: Record<string, unknown>;
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
    const slugParts = parts.slice(1).map(p => p.replace('.md', '').normalize('NFC'));
    
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
  const decodedTargetSlug = slug.map(s => decodeURIComponent(s).normalize('NFC'));
  return allContent.find(c => c.lang === lang && c.slug.join('/') === decodedTargetSlug.join('/')) || null;
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

// Define explicit order for known titles (to match user's HTML screenshot exactly)
const EXPLICIT_ORDER: Record<string, number> = {
  // Main Categories
  "Die Befreiung": 1,
  "The Awakened Masculine": 2,
  "Somatic Developmental Trauma": 3,
  "Embodied Relationship Intimacy": 4,
  "Neo Emotional Release": 5,

  // Die Befreiung - Subpages
  "Kompendium: Das Fundament": 10,
  "Kompendium: Verschmelzungstyp": 20,
  "Kompendium: Autonomietyp": 30,
  "Frageprotokoll: Reality Check": 40,
  "Fallanalyse: Geldmangel": 50,
  "Fallanalyse: Stress & Burnout": 60,
  "Frageprotokoll: Stress (VT)": 70,
  "Transkripte Bibliothek": 80,
  "Willkommen": 81,
  "Das Fundament": 82,
  "Geldmangel": 83,
  "Stress und Burnout": 84,
  "Angst und Panik": 85,
  "Gopal antwortet": 86,
  "Live Calls": 87,
  "Praxis-Guides & Arbeitsmaterial": 90
};

function sortNavItems(items: NavItem[]) {
  items.sort((a, b) => {
    // 1. If both are in EXPLICIT_ORDER, use that
    const orderA = EXPLICIT_ORDER[a.title];
    const orderB = EXPLICIT_ORDER[b.title];
    
    if (orderA !== undefined && orderB !== undefined) {
      return orderA - orderB;
    }
    if (orderA !== undefined) return -1;
    if (orderB !== undefined) return 1;
    
    // 2. Otherwise sort by prefix numbers in slug if available, else title
    const rawA = a.slug ? a.slug[a.slug.length - 1] : a.title;
    const rawB = b.slug ? b.slug[b.slug.length - 1] : b.title;
    const matchA = rawA.match(/^0*(\d+)/);
    const matchB = rawB.match(/^0*(\d+)/);
    if (matchA && matchB) {
      const numA = parseInt(matchA[1], 10);
      const numB = parseInt(matchB[1], 10);
      if (numA !== numB) {
        return numA - numB;
      }
    }
    
    // 3. Alphabetical
    return rawA.localeCompare(rawB);
  });

  items.forEach(item => {
    if (item.children) {
      sortNavItems(item.children);
    }
  });
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
  
  // Sort the entire tree according to the explicit order
  sortNavItems(root);
  
  return root;
}
