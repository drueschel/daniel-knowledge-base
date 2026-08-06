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
            // Leaf node (File)
            const url = `/${lang}/${item.slug.join('/')}`;
            const isActive = url === currentSlug;
            return (
              <li key={item.slug.join('/')} className={styles.fileItem}>
                <Link href={url} className={`${styles.link} ${isActive ? styles.active : ''}`}>
                  {item.title}
                </Link>
              </li>
            );
          } else {
            // Folder node
            const isExpanded = expanded[item.title] !== false; // default true if not set
            
            // Level 0: Main Category (Die Befreiung)
            if (level === 0) {
              return (
                <li key={item.title} className={styles.level0}>
                  <button className={styles.btnLevel0} onClick={() => toggleFolder(item.title)}>
                    <div className={styles.level0Content}>
                      <span className={styles.iconLevel0}>🔒</span>
                      <span>{item.title}</span>
                    </div>
                    <span className={styles.arrowLevel0}>{isExpanded ? 'v' : '>'}</span>
                  </button>
                  {isExpanded && item.children && renderTree(item.children, level + 1)}
                </li>
              );
            }

            // Level 1: Sub-category (TRANSKRIPT-BIBLIOTHEK)
            if (level === 1) {
              let icon = '📖';
              if (item.title.toLowerCase().includes('praxis')) icon = '🛠️';
              
              return (
                <li key={item.title} className={styles.level1}>
                  <button className={styles.btnLevel1} onClick={() => toggleFolder(item.title)}>
                    <span className={styles.arrowLevel1}>{isExpanded ? '▾' : '▸'}</span>
                    <span className={styles.iconLevel1}>{icon}</span>
                    <span className={styles.textLevel1}>{item.title}</span>
                  </button>
                  {isExpanded && item.children && renderTree(item.children, level + 1)}
                </li>
              );
            }

            // Level 2: Sub-sub-category (Willkommen, Geldmangel)
            if (level === 2) {
              return (
                <li key={item.title} className={styles.level2}>
                  <button className={styles.btnLevel2} onClick={() => toggleFolder(item.title)}>
                    <span className={styles.arrowLevel2}>{isExpanded ? '▾' : '▸'}</span>
                    <span className={styles.textLevel2}>{item.title}</span>
                  </button>
                  {isExpanded && item.children && renderTree(item.children, level + 1)}
                </li>
              );
            }

            // Deeper levels (fallback)
            return (
              <li key={item.title}>
                <button className={styles.btnLevel2} onClick={() => toggleFolder(item.title)}>
                  <span className={styles.arrowLevel2}>{isExpanded ? '▾' : '▸'}</span>
                  <span className={styles.textLevel2}>{item.title}</span>
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
