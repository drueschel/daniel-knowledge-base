'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useCommandPalette } from './CommandPaletteContext';
import { SearchIcon } from './sidebar/SidebarIcons';
import styles from './TopbarSearch.module.css';

export default function TopbarSearch({ lang }: { lang: string }) {
  const pathname = usePathname();
  const { open } = useCommandPalette();

  // Hide on the home page (e.g. "/de" or "/en")
  if (pathname === `/${lang}`) {
    return null;
  }

  const isEn = lang === 'en';

  return (
    <button
      type="button"
      className={styles.triggerBtn}
      onClick={open}
      aria-label={isEn ? 'Open search (⌘K)' : 'Suche öffnen (⌘K)'}
      title={isEn ? 'Search docs (⌘K)' : 'Suche in Dokumenten (⌘K)'}
    >
      <span className={styles.iconWrap}>
        <SearchIcon size={14} />
      </span>
      <span className={styles.label}>
        {isEn ? 'Search 420+ docs...' : 'Suche in 420+ Dokus...'}
      </span>
      <kbd className={styles.kbdBadge}>
        ⌘K
      </kbd>
    </button>
  );
}
