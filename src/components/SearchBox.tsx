'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './SearchBox.module.css';

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  lang: string;
}

export default function SearchBox({ lang, large = false }: { lang: string, large?: boolean }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {

    const delayDebounceFn = setTimeout(async () => {
      if (!query.trim()) {
        setResults([]);
        setIsOpen(false);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&lang=${lang}`);
        const data = await res.json();
        setResults(data.results || []);
        setIsOpen(true);
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, lang]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      setIsOpen(false);
      router.push(`/${lang}/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className={`${styles.container} ${large ? styles.large : ''}`}>
      <svg
        className={styles.searchIcon}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
      <input
        ref={inputRef}
        type="search"
        className={styles.input}
        placeholder={lang === 'de' ? 'Suchen...' : 'Search...'}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (results.length > 0) setIsOpen(true);
        }}
      />

      {isOpen && query.trim() && (
        <div className={styles.dropdown} ref={dropdownRef}>
          {isLoading && <div className={styles.loading}>{lang === 'de' ? 'Lade...' : 'Loading...'}</div>}
          
          {!isLoading && results.length === 0 && (
            <div className={styles.loading}>{lang === 'de' ? 'Keine Ergebnisse' : 'No results found'}</div>
          )}

          {!isLoading && results.slice(0, 5).map((res, i) => (
            <Link 
              key={i} 
              href={`${res.url}?highlight=${encodeURIComponent(query)}`}
              className={styles.resultItem}
              onClick={() => setIsOpen(false)}
            >
              <span className={styles.resultTitle}>{res.title}</span>
              <span className={styles.resultSnippet}>{res.snippet}</span>
            </Link>
          ))}

          {!isLoading && results.length > 0 && (
            <Link 
              href={`/${lang}/search?q=${encodeURIComponent(query)}`}
              className={styles.seeAll}
              onClick={() => setIsOpen(false)}
            >
              {lang === 'de' ? `Alle ${results.length} Ergebnisse ansehen` : `See all ${results.length} results`}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
