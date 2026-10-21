'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCommandPalette } from './CommandPaletteContext';
import { SearchIcon, DocumentIcon, VideoIcon } from './sidebar/SidebarIcons';
import styles from './CommandPalette.module.css';

interface SearchResult {
  title: string;
  url: string;
  snippet?: string;
}

function getDefaultSuggestions(lang: string): SearchResult[] {
  return [
    {
      title: 'PAL: Gopal Norbert Klein – Live Reality-Check',
      url: `/${lang}/1_Die_Befreiung/PAL/01_PAL_Avatar_Uebersicht`,
      snippet: 'Interaktive 1:1 Live-Avatar Sitzung zur Bindungsangst'
    },
    {
      title: 'Kompendium: Das Fundament',
      url: `/${lang}/1_Die_Befreiung/01_Kompendium_Das_Fundament`,
      snippet: 'Grundlagen des Nervensystems & Trauma-Heilung'
    },
    {
      title: 'Kompendium: Autonomietyp',
      url: `/${lang}/1_Die_Befreiung/03_Kompendium_Autonomietyp`,
      snippet: 'Schutzmechanismen & Heilungsweg des Autonomietypen'
    },
    {
      title: 'Kompendium: Verschmelzungstyp',
      url: `/${lang}/1_Die_Befreiung/02_Kompendium_Verschmelzungstyp`,
      snippet: 'Schutzmechanismen & Heilungsweg des Verschmelzungstypen'
    }
  ];
}

export default function CommandPalette({ lang }: { lang: string }) {
  const { isOpen, close } = useCommandPalette();
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Focus input whenever modal opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Debounced search fetch
  useEffect(() => {
    if (!isOpen || !query.trim()) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&lang=${lang}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.results || []);
          setSelectedIndex(0);
        }
      } catch {
        // Fallback on network error
      } finally {
        setIsLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query, isOpen, lang]);

  // Determine active results list
  const defaultSuggestions = useMemo(() => getDefaultSuggestions(lang), [lang]);

  const results = useMemo(() => {
    if (!query.trim()) {
      return defaultSuggestions;
    }
    return searchResults;
  }, [query, searchResults, defaultSuggestions]);

  const handleClose = useCallback(() => {
    setQuery('');
    setSelectedIndex(0);
    close();
  }, [close]);

  const handleSelect = useCallback((item: SearchResult) => {
    handleClose();
    if (item.url) {
      router.push(item.url);
    }
  }, [handleClose, router]);

  // Keyboard navigation inside modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (results.length > 0 ? (prev + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    }
  };

  // Scroll active item into view inside the modal list
  useEffect(() => {
    if (!listRef.current) return;
    const selectedEl = listRef.current.children[selectedIndex] as HTMLElement;
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      className={styles.backdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={lang === 'en' ? 'Command Palette Search' : 'Befehlspalette Suche'}
    >
      <div className={styles.modal} onKeyDown={handleKeyDown}>
        {/* Search Input Bar */}
        <div className={styles.searchHeader}>
          <span className={styles.searchIcon}>
            <SearchIcon size={16} />
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder={
              lang === 'en'
                ? 'Type to search all 420+ documents...'
                : 'Suche in allen 420+ Dokumenten...'
            }
            className={styles.input}
            aria-autocomplete="list"
          />
          <kbd className={styles.escBadge} onClick={handleClose}>ESC</kbd>
        </div>

        {/* Results List */}
        <ul ref={listRef} className={styles.resultsList} role="listbox">
          {isLoading && query.trim() ? (
            <li className={styles.emptyState}>
              <span>{lang === 'en' ? 'Searching...' : 'Suche läuft...'}</span>
            </li>
          ) : results.length === 0 ? (
            <li className={styles.emptyState}>
              <div>{lang === 'en' ? 'No results found' : 'Keine Treffer gefunden'}</div>
              <div className={styles.emptyHint}>
                {lang === 'en'
                  ? 'Try searching for topics like "PAL", "Autonomie", or "Gopal"'
                  : 'Versuche Begriffe wie „PAL“, „Autonomie“ oder „Bindung“'}
              </div>
            </li>
          ) : (
            results.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const isPal = (item.url || '').includes('PAL');

              return (
                <li
                  key={item.url || idx}
                  role="option"
                  aria-selected={isSelected}
                  className={`${styles.item} ${isSelected ? styles.itemSelected : ''}`}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div className={styles.itemIconSlot}>
                    {isPal ? <VideoIcon size={14} /> : <DocumentIcon size={14} />}
                  </div>
                  <div className={styles.itemDetails}>
                    <span className={styles.itemTitle}>{item.title}</span>
                    <span className={styles.itemPath}>
                      {item.snippet ? item.snippet : item.url.replace(/^\/[a-z]{2}\//, '').replace(/_/g, ' ')}
                    </span>
                  </div>
                  <span className={styles.enterBadge}>↵ Öffnen</span>
                </li>
              );
            })
          )}
        </ul>

        {/* Footer Keyboard Hints */}
        <div className={styles.footer}>
          <div className={styles.footerShortcuts}>
            <div className={styles.shortcutItem}>
              <kbd className={styles.kbd}>↑</kbd>
              <kbd className={styles.kbd}>↓</kbd>
              <span>{lang === 'en' ? 'Navigate' : 'Navigieren'}</span>
            </div>
            <div className={styles.shortcutItem}>
              <kbd className={styles.kbd}>↵</kbd>
              <span>{lang === 'en' ? 'Select' : 'Öffnen'}</span>
            </div>
            <div className={styles.shortcutItem}>
              <kbd className={styles.kbd}>esc</kbd>
              <span>{lang === 'en' ? 'Close' : 'Schließen'}</span>
            </div>
          </div>
          <div>
            <span>Daniels Knowledge Base</span>
          </div>
        </div>
      </div>
    </div>
  );
}
