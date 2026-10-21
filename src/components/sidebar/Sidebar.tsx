'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavItem } from '@/lib/markdown';
import { useMobileMenu } from '../MobileMenuContext';
import { SidebarSearch } from './SidebarSearch';
import { SidebarNode } from './SidebarNode';
import { useTreeState, getAllFolderKeys } from './useTreeState';
import { useTreeFilter } from './useTreeFilter';
import { ExpandIcon, CollapseIcon } from './SidebarIcons';
import styles from './Sidebar.module.css';

interface SidebarProps {
  nav: NavItem[];
  lang: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ nav, lang }) => {
  const pathname = usePathname();
  const { isOpen: isMobileOpen, setIsOpen: setIsMobileOpen } = useMobileMenu();
  const navContainerRef = useRef<HTMLElement>(null);

  // In-Tree Filter state
  const [query, setQuery] = useState('');
  const { filteredItems, matchCount, matchedFolderKeys, isFiltering } = useTreeFilter(nav, query);

  // Tree Open/Collapse State
  const { isOpen, toggle, expandAll, collapseAll } = useTreeState(nav, pathname);

  // All folder keys for expand all
  const allFolderKeys = useMemo(() => getAllFolderKeys(nav), [nav]);

  const handleExpandAll = () => expandAll(allFolderKeys);
  const handleCollapseAll = () => collapseAll();
  const handleCloseMobile = () => setIsMobileOpen(false);

  // Auto-scroll active item into view
  useEffect(() => {
    if (!navContainerRef.current) return;
    const activeEl = navContainerRef.current.querySelector<HTMLElement>('[data-active="true"]');
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [pathname]);

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className={styles.backdrop}
          onClick={handleCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside className={`${styles.sidebar} ${isMobileOpen ? styles.sidebarOpen : ''}`}>
        {/* Header */}
        <Link
          href={`/${lang}`}
          className={styles.sidebarHeader}
          onClick={handleCloseMobile}
        >
          <div className={styles.sidebarLogoIcon}>DKB</div>
          <div className={styles.sidebarHeaderInfo}>
            <span className={styles.sidebarLogoTitle}>Daniel Knowledge Base</span>
            <span className={styles.sidebarLogoSubtitle}>
              {lang === 'en' ? 'Living Compendium' : 'Wissens-Kompendium'}
            </span>
          </div>
        </Link>

        {/* In-Tree Realtime Search Filter */}
        <SidebarSearch
          query={query}
          onChange={setQuery}
          matchCount={matchCount}
          isFiltering={isFiltering}
          lang={lang}
        />

        {/* Toolbar Controls */}
        <div className={styles.sidebarControls}>
          <div className={styles.controlsGroup}>
            <button
              type="button"
              onClick={handleExpandAll}
              title={lang === 'en' ? 'Expand all folders' : 'Alle Ordner ausklappen'}
              aria-label={lang === 'en' ? 'Expand all folders' : 'Alle Ordner ausklappen'}
              className={styles.controlBtn}
            >
              <ExpandIcon size={12} />
              <span>{lang === 'en' ? 'Expand all' : 'Ausklappen'}</span>
            </button>
            <button
              type="button"
              onClick={handleCollapseAll}
              title={lang === 'en' ? 'Collapse all folders' : 'Alle Ordner einklappen'}
              aria-label={lang === 'en' ? 'Collapse all folders' : 'Alle Ordner einklappen'}
              className={styles.controlBtn}
            >
              <CollapseIcon size={12} />
              <span>{lang === 'en' ? 'Collapse all' : 'Einklappen'}</span>
            </button>
          </div>
        </div>

        {/* Hierarchical Nav Tree */}
        <nav
          ref={navContainerRef}
          className={styles.sidebarNav}
          role="tree"
          aria-label={lang === 'en' ? 'Knowledge Base Navigation' : 'Knowledge Base Navigation'}
        >
          <ul className={styles.treeRoot} role="group">
            {filteredItems.map((item) => (
              <SidebarNode
                key={item.slug ? item.slug.join('/') : item.title}
                item={item}
                level={0}
                parentKey=""
                lang={lang}
                pathname={pathname}
                isOpen={isOpen}
                toggle={toggle}
                isFiltering={isFiltering}
                matchedFolderKeys={matchedFolderKeys}
                onSelectLeaf={handleCloseMobile}
              />
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
