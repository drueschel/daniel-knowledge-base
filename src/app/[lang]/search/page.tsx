import { getAllContent } from '@/lib/markdown';
import Link from 'next/link';
import styles from './page.module.css';

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { lang } = await params;
  const resolvedSearchParams = await searchParams;
  const rawQuery = resolvedSearchParams.q;
  const query = typeof rawQuery === 'string' ? rawQuery : '';
  const lowerQuery = query.toLowerCase();

  const allContent = getAllContent();
  
  interface SearchResult {
    title: string;
    url: string;
    snippet: string;
    lang: string;
  }
  
  let searchResults: SearchResult[] = [];
  
  if (query) {
    searchResults = allContent
      .filter(item => {
        // if (item.lang !== lang) return false;
        return (
          item.title.toLowerCase().includes(lowerQuery) ||
          item.content.toLowerCase().includes(lowerQuery)
        );
      })
      .map(item => {
        let snippet = '';
        const contentLower = item.content.toLowerCase();
        const matchIndex = contentLower.indexOf(lowerQuery);

        if (matchIndex !== -1) {
          const start = Math.max(0, matchIndex - 80);
          const end = Math.min(item.content.length, matchIndex + 80 + lowerQuery.length);
          snippet = item.content.substring(start, end).replace(/\n/g, ' ');
          if (start > 0) snippet = '...' + snippet;
          if (end < item.content.length) snippet = snippet + '...';
        } else {
          snippet = item.content.substring(0, 160).replace(/\n/g, ' ') + '...';
        }

        return {
          ...item,
          url: `/${item.lang}/${item.slug.join('/')}`,
          snippet
        };
      });
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          {lang === 'de' ? 'Suchergebnisse' : 'Search Results'}
        </h1>
        {query ? (
          <p className={styles.subtitle}>
            {lang === 'de' ? `Ergebnisse für "${query}"` : `Results for "${query}"`}
            {' '}({searchResults.length})
          </p>
        ) : (
          <p className={styles.subtitle}>
            {lang === 'de' ? 'Bitte gib einen Suchbegriff ein.' : 'Please enter a search term.'}
          </p>
        )}
      </div>

      {query && searchResults.length === 0 && (
        <div className={styles.noResults}>
          {lang === 'de' 
            ? 'Es wurden keine passenden Inhalte gefunden. Versuche einen anderen Begriff.' 
            : 'No matching content found. Please try another term.'}
        </div>
      )}

      {searchResults.length > 0 && (
        <div className={styles.resultList}>
          {searchResults.map((res, i) => (
            <Link key={i} href={`${res.url}?highlight=${encodeURIComponent(query)}`} style={{ textDecoration: 'none' }}>
              <div className={styles.resultCard}>
                <div className={styles.resultTitle}>{res.title}</div>
                <div className={styles.resultUrl}>{res.url}</div>
                <div className={styles.resultSnippet}>{res.snippet}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
