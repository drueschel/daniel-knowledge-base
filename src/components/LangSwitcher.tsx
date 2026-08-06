'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './LangSwitcher.module.css';

export default function LangSwitcher({ currentLang }: { currentLang: string }) {
  const pathname = usePathname();
  
  // Replace current lang in the path with the other lang
  const togglePath = pathname.replace(`/${currentLang}`, currentLang === 'en' ? '/de' : '/en');

  return (
    <div className={styles.switcher}>
      <Link 
        href={pathname.replace(`/${currentLang}`, '/de')} 
        className={`${styles.btn} ${currentLang === 'de' ? styles.active : ''}`}
      >
        DE
      </Link>
      <Link 
        href={pathname.replace(`/${currentLang}`, '/en')} 
        className={`${styles.btn} ${currentLang === 'en' ? styles.active : ''}`}
      >
        EN
      </Link>
    </div>
  );
}
