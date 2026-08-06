'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';
import { NavItem } from '@/lib/markdown';

export default function Sidebar({ nav, lang }: { nav: NavItem[], lang: string }) {
  const kbName = 'Daniel Knowledge Base';
  const pathname = usePathname();

  const displayTitle = (title: string) => {
    return title.replace(/^\d+[\._\s:-]+\s*/, '').replace(/_Summary$/i, '').trim();
  };

  const isItemActive = (item: NavItem): boolean => {
    if (item.slug) {
      const url = `/${lang}/${item.slug.join('/')}`;
      return url === pathname;
    }
    if (item.children) {
      return item.children.some(child => isItemActive(child));
    }
    return false;
  };

function SidebarDetails({ 
  title, 
  className, 
  icon, 
  isActive,
  level,
  children 
}: { 
  title: string; 
  className: string; 
  icon?: React.ReactNode; 
  isActive: boolean;
  level: number;
  children: React.ReactNode 
}) {
  const [isOpen, setIsOpen] = useState(isActive || level === 0);

  // Auto-expand if a child becomes active (e.g., from search or main content link)
  useEffect(() => {
    if (isActive) {
      setIsOpen(true);
    }
  }, [isActive]);

  return (
    <details 
      className={className} 
      open={isOpen} 
      onToggle={(e) => setIsOpen(e.currentTarget.open)}
    >
      <summary>
        {icon && <span className={styles.navCourseIcon}>{icon}</span>}
        {icon ? ' ' : ''}{title}
      </summary>
      {children}
    </details>
  );
}

  const renderTree = (items: NavItem[], level = 0) => {
    // If it's a list of leaves, render them directly in a <ul>
    const allLeaves = items.every(item => !!item.slug);
    
    if (allLeaves) {
      return (
        <ul className={level === 1 ? styles.navLessonsFlat : styles.navLessons}>
          {items.map(item => {
            const url = `/${lang}/${item.slug!.join('/')}`;
            const isActive = url === pathname;
            return (
              <li key={item.slug!.join('/')}>
                <Link href={url} className={isActive ? styles.active : ''}>
                  {displayTitle(item.title)}
                </Link>
              </li>
            );
          })}
        </ul>
      );
    }

    return (
      <>
        {items.map(item => {
          const isLeaf = !!item.slug;
          
          if (isLeaf) {
            const url = `/${lang}/${item.slug!.join('/')}`;
            const isActive = url === pathname;
            return (
              <ul key={item.slug!.join('/')} className={level === 1 ? styles.navLessonsFlat : styles.navLessons}>
                <li>
                  <Link href={url} className={isActive ? styles.active : ''}>
                    {displayTitle(item.title)}
                  </Link>
                </li>
              </ul>
            );
          }

          const isActive = isItemActive(item);

          if (level === 0) {
            return (
              <SidebarDetails 
                key={item.title} 
                title={displayTitle(item.title)} 
                className={styles.navCourse} 
                icon="🔓"
                isActive={isActive}
                level={level}
              >
                {item.children && renderTree(item.children, level + 1)}
              </SidebarDetails>
            );
          }
          
          if (level === 1) {
            const isPraxis = item.title.toLowerCase().includes('praxis') || item.title.toLowerCase().includes('arbeitsmaterial');
            return (
              <SidebarDetails 
                key={item.title} 
                title={displayTitle(item.title)} 
                className={styles.navDim}
                icon={isPraxis ? '🛠️' : '📖'}
                isActive={isActive}
                level={level}
              >
                {item.children && renderTree(item.children, level + 1)}
              </SidebarDetails>
            );
          }

          // Level 2+ (Modules)
          return (
            <SidebarDetails 
              key={item.title} 
              title={displayTitle(item.title)} 
              className={styles.navMod}
              isActive={isActive}
              level={level}
            >
              {item.children && renderTree(item.children, level + 1)}
            </SidebarDetails>
          );
        })}
      </>
    );
  };

  return (
    <aside className={styles.sidebar}>
      <Link href={`/${lang}`} className={styles.sidebarHeader}>
        <div className={styles.sidebarLogoIcon}>DKB</div>
        <div className={styles.sidebarLogo}>{kbName}</div>
      </Link>
      <nav className={styles.sidebarNav}>
        {renderTree(nav)}
      </nav>
    </aside>
  );
}
