'use client';
import { useState } from 'react';
import Link from 'next/link';
import styles from './Sidebar.module.css';
import { NavItem } from '@/lib/markdown';

export default function Sidebar({ nav, lang, currentSlug }: { nav: NavItem[], lang: string, currentSlug: string }) {
  const kbName = 'Daniel Knowledge Base';
  
  // Keep track of expanded folders
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    'Die Befreiung': true,
    'Somatic Developmental Trauma': true,
    'Embodied Relationship & Intimacy': true,
    'Neo Emotional Release': true,
  });

  const toggleFolder = (title: string) => {
    setExpanded(prev => ({ ...prev, [title]: !prev[title] }));
  };
  
  const renderTree = (items: NavItem[], level = 0) => {
    return (
      <ul className={styles.list} style={{ paddingLeft: level > 0 ? '1rem' : '0' }}>
        {items.map(item => {
          if (item.slug) {
            const url = `/${lang}/${item.slug.join('/')}`;
            const isActive = url === currentSlug;
            return (
              <li key={item.slug.join('/')}>
                <Link href={url} className={`${styles.link} ${isActive ? styles.active : ''}`}>
                  <span className={styles.itemIcon}>▶</span> {item.title}
                </Link>
              </li>
            );
          } else {
            const isExpanded = expanded[item.title] !== false; // default true if not set
            let folderIcon = '📁';
            if (level === 0) folderIcon = '🔒';
            else if (level === 1) folderIcon = '📖';
            else if (level === 2) folderIcon = '🛠️';

            return (
              <li key={item.title} className={styles.folder}>
                <button 
                  className={styles.folderTitle} 
                  onClick={() => toggleFolder(item.title)}
                >
                  <span className={styles.folderArrow}>{isExpanded ? '▼' : '▶'}</span>
                  <span className={styles.folderIcon}>{folderIcon}</span>
                  {item.title}
                </button>
                {isExpanded && item.children && renderTree(item.children, level + 1)}
              </li>
            );
          }
        })}
      </ul>
    );
  };

  return (
    <aside className={`${styles.sidebar} glass`}>
      <div className={styles.header}>
        <Link href={`/${lang}`} className={styles.logo}>
          <span className={styles.icon}>DKB</span>
          <span className={styles.title}>{kbName}</span>
        </Link>
      </div>
      <nav className={styles.nav}>
        {renderTree(nav)}
      </nav>
    </aside>
  );
}
