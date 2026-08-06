import Link from 'next/link';
import styles from './Sidebar.module.css';
import { NavItem } from '@/lib/markdown';

export default function Sidebar({ nav, lang, currentSlug }: { nav: NavItem[], lang: string, currentSlug: string }) {
  const kbName = 'Daniel Knowledge Base';
  
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
                  {item.title}
                </Link>
              </li>
            );
          } else {
            return (
              <li key={item.title} className={styles.folder}>
                <span className={styles.folderTitle}>{item.title}</span>
                {item.children && renderTree(item.children, level + 1)}
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
