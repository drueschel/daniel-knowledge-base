import Link from 'next/link';
import styles from './Sidebar.module.css';
import { MarkdownFile } from '@/lib/markdown';

export default function Sidebar({ nav, lang, currentSlug }: { nav: Record<string, MarkdownFile[]>, lang: string, currentSlug: string }) {
  const kbName = lang === 'en' ? 'Knowledge Base' : 'Wissensdatenbank';
  
  return (
    <aside className={`${styles.sidebar} glass`}>
      <div className={styles.header}>
        <Link href={`/${lang}`} className={styles.logo}>
          <span className={styles.icon}>DKB</span>
          <span className={styles.title}>{kbName}</span>
        </Link>
      </div>
      <nav className={styles.nav}>
        {Object.keys(nav).sort().map(category => (
          <div key={category} className={styles.category}>
            <h3 className={styles.categoryTitle}>{category}</h3>
            <ul className={styles.list}>
              {nav[category].map(item => {
                const url = `/${lang}/${item.slug.join('/')}`;
                const isActive = url === currentSlug;
                return (
                  <li key={item.slug.join('/')}>
                    <Link href={url} className={`${styles.link} ${isActive ? styles.active : ''}`}>
                      {item.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
