'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';
import { NavItem } from '@/lib/markdown';
import { useMobileMenu } from './MobileMenuContext';

export default function Sidebar({ nav, lang }: { nav: NavItem[], lang: string }) {
  const kbName = 'Daniel Knowledge Base';
  const pathname = usePathname();
  const { isOpen: isMobileOpen, setIsOpen: setIsMobileOpen } = useMobileMenu();

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
                <Link 
                  href={url} 
                  className={isActive ? styles.active : ''}
                  onClick={() => setIsMobileOpen(false)}
                >
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
                  <Link 
                    href={url} 
                    className={isActive ? styles.active : ''}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    {displayTitle(item.title)}
                  </Link>
                </li>
              </ul>
            );
          }

          const isActive = isItemActive(item);

          if (level === 0) {
            // A course is considered to have content if it has any child that is not a coming_soon file
            const hasContent = item.children && item.children.some(child => {
              if (child.slug) {
                return !child.slug[child.slug.length - 1].includes('coming_soon');
              }
              // If it has folders/children, it implies it has content
              return true;
            });

            return (
              <SidebarDetails 
                key={item.title} 
                title={displayTitle(item.title)} 
                className={`${styles.navCourse} ${!hasContent ? styles.lockedCourse : ''}`}
                icon={hasContent ? '🔓' : '🔒'}
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
    <>
      {/* Backdrop for mobile */}
      {isMobileOpen && (
        <div 
          className={styles.backdrop} 
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside className={`${styles.sidebar} ${isMobileOpen ? styles.sidebarOpen : ''}`}>
        <Link href={`/${lang}`} className={styles.sidebarHeader} onClick={() => setIsMobileOpen(false)}>
          <div className={styles.sidebarLogoIcon}>DKB</div>
          <div className={styles.sidebarLogo}>{kbName}</div>
        </Link>
        <nav className={styles.sidebarNav}>
          {renderTree(nav)}
        </nav>
      </aside>
    </>
  );
}
