'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './Breadcrumbs.module.css';

export default function Breadcrumbs() {
  const pathname = usePathname();
  // e.g. /de/1_Die_Befreiung/Transkripte_Bibliothek/01_Herzlich_Willkommen_Summary
  
  if (!pathname) return null;
  
  const segments = pathname.split('/').filter(Boolean);
  
  // If we are at root /de or /en, just show Home
  if (segments.length <= 1) {
    return (
      <div className={styles.breadcrumbs}>
        <span className={styles.current}>Home</span>
      </div>
    );
  }

  // Remove the lang segment
  const pathSegments = segments.slice(1);
  const lang = segments[0];

  return (
    <div className={styles.breadcrumbs}>
      <Link href={`/${lang}`} className={styles.link}>Home</Link>
      {pathSegments.map((segment, index) => {
        const isLast = index === pathSegments.length - 1;
        // Clean up the text: remove numbers, underscores
        const title = decodeURIComponent(segment).replace(/^\d+_/, '').replace(/_/g, ' ');
        const url = `/${lang}/${pathSegments.slice(0, index + 1).join('/')}`;

        return (
          <span key={url} className={styles.segment}>
            <span className={styles.separator}>/</span>
            {isLast ? (
              <span className={styles.current}>{title}</span>
            ) : (
              <Link href={url} className={styles.link}>{title}</Link>
            )}
          </span>
        );
      })}
    </div>
  );
}
