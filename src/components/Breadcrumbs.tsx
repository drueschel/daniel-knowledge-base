'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './Breadcrumbs.module.css';
import { NavItem } from '@/lib/markdown';

function cleanTitle(str: string): string {
  return str.replace(/^\d+_/, '').replace(/_/g, ' ');
}

export default function Breadcrumbs({ nav }: { nav: NavItem[] }) {
  const pathname = usePathname();
  
  if (!pathname) return null;
  
  const segments = pathname.split('/').filter(Boolean);
  
  if (segments.length <= 1) {
    return (
      <div className={styles.breadcrumbs}>
        <span className={styles.current}>Home</span>
      </div>
    );
  }

  const pathSegments = segments.slice(1);
  const currentLang = segments[0];

  let currentLevel = nav;
  const breadcrumbItems = [];
  
  for (let i = 0; i < pathSegments.length; i++) {
    const segment = pathSegments[i];
    const decodedSegment = decodeURIComponent(segment).normalize('NFC');
    let title = cleanTitle(decodedSegment);
    
    // Attempt to find real translated title in the nav tree
    if (currentLevel) {
      const node = currentLevel.find(n => {
        if (n.slug) {
          // Leaf node match by slug
          return n.slug[n.slug.length - 1] === decodedSegment;
        } else {
          // Folder node match by clean title
          return n.title === cleanTitle(decodedSegment);
        }
      });
      
      if (node) {
        title = node.title;
        currentLevel = node.children || [];
      } else {
        currentLevel = []; // Stop digging if path is broken
      }
    }
    
    const url = `/${currentLang}/${pathSegments.slice(0, i + 1).join('/')}`;
    breadcrumbItems.push({ title, url });
  }

  return (
    <div className={styles.breadcrumbs}>
      <Link href={`/${currentLang}`} className={styles.link}>Home</Link>
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;

        return (
          <span key={item.url} className={styles.segment}>
            <span className={styles.separator}>{'>'}</span>
            {isLast ? (
              <span className={styles.current}>{item.title}</span>
            ) : (
              <Link href={item.url} className={styles.link}>{item.title}</Link>
            )}
          </span>
        );
      })}
    </div>
  );
}
