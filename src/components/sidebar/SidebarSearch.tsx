import React from 'react';
import { SearchIcon, ClearIcon } from './SidebarIcons';
import styles from './Sidebar.module.css';

interface SidebarSearchProps {
  query: string;
  onChange: (value: string) => void;
  matchCount: number;
  isFiltering: boolean;
  lang: string;
}

export const SidebarSearch: React.FC<SidebarSearchProps> = ({
  query,
  onChange,
  matchCount,
  isFiltering,
  lang
}) => {
  const placeholder = lang === 'en' ? 'Filter navigation...' : 'In Navigation filtern...';
  const label = lang === 'en' ? 'Filter documents' : 'Dokumente filtern';

  return (
    <div className={styles.searchWrapper}>
      <div className={styles.searchInputContainer}>
        <span className={styles.searchIconSlot}>
          <SearchIcon size={14} />
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label={label}
          className={styles.searchInput}
        />
        {query ? (
          <button
            type="button"
            onClick={() => onChange('')}
            className={styles.searchClearBtn}
            title={lang === 'en' ? 'Clear filter' : 'Filter löschen'}
            aria-label={lang === 'en' ? 'Clear filter' : 'Filter löschen'}
          >
            <ClearIcon size={12} />
          </button>
        ) : null}
      </div>

      {isFiltering && (
        <div className={styles.searchMatchBanner}>
          <span>
            {matchCount}{' '}
            {lang === 'en'
              ? matchCount === 1 ? 'match' : 'matches'
              : matchCount === 1 ? 'Treffer' : 'Treffer'}
          </span>
          {matchCount === 0 && (
            <span className={styles.noMatchHint}>
              {lang === 'en' ? 'No pages found' : 'Keine Seiten gefunden'}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
