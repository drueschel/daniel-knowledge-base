'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './LangSwitcher.module.css';

export default function LangSwitcher({ currentLang, routeMappings }: { currentLang: string, routeMappings?: Record<string, string> }) {
  const pathname = usePathname();
  
  // Try to find exact mapping, fallback to root language paths if not found
  const decodedPathname = decodeURIComponent(pathname);
  
  const targetLang = currentLang === 'de' ? 'en' : 'de';
  let deUrl = '/de';
  let enUrl = '/en';

  if (currentLang === 'de') {
    deUrl = pathname;
    enUrl = routeMappings?.[decodedPathname] || '/en';
  } else {
    enUrl = pathname;
    deUrl = routeMappings?.[decodedPathname] || '/de';
  }

  return (
    <div className={styles.switcher}>
      <Link 
        href={deUrl} 
        className={`${styles.btn} ${currentLang === 'de' ? styles.active : ''}`}
      >
        DE
      </Link>
      <Link 
        href={enUrl} 
        className={`${styles.btn} ${currentLang === 'en' ? styles.active : ''}`}
      >
        EN
      </Link>
    </div>
  );
}
