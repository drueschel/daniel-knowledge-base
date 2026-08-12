'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';
import { NavItem } from '@/lib/markdown';
import { useMobileMenu } from './MobileMenuContext';

function SidebarDetails({ 
  title, 
  className, 
  icon, 
  isActive,
  level,
  expandSignal,
  collapseSignal,
  children 
}: { 
  title: string; 
  className: string; 
  icon?: React.ReactNode; 
  isActive: boolean;
  level: number;
  expandSignal: number;
  collapseSignal: number;
  children: React.ReactNode 
}) {
  const [isOpen, setIsOpen] = useState(isActive);

  // Auto-expand if a child becomes active (e.g., from search or main content link)
  useEffect(() => {
    if (isActive) {
      setIsOpen(true);
    }
  }, [isActive]);

  useEffect(() => {
    if (expandSignal > 0) setIsOpen(true);
  }, [expandSignal]);

  useEffect(() => {
    if (collapseSignal > 0) setIsOpen(false);
  }, [collapseSignal]);

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

export default function Sidebar({ nav, lang }: { nav: NavItem[], lang: string }) {
  const kbName = 'Daniel Knowledge Base';
  const pathname = usePathname();
  const { isOpen: isMobileOpen, setIsOpen: setIsMobileOpen } = useMobileMenu();
  const [expandSignal, setExpandSignal] = useState(0);
  const [collapseSignal, setCollapseSignal] = useState(0);

  const expandAll = () => setExpandSignal(s => s + 1);
  const collapseAll = () => setCollapseSignal(s => s + 1);

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

  const renderTree = (items: NavItem[], level = 0, parentPath = '') => {
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
          const nodeKey = parentPath ? `${parentPath}/${item.title}` : item.title;
          
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
                key={nodeKey} 
                title={displayTitle(item.title)} 
                className={`${styles.navCourse} ${!hasContent ? styles.lockedCourse : ''}`}
                icon={hasContent ? '🔓' : '🔒'}
                isActive={isActive}
                level={level}
                expandSignal={expandSignal}
                collapseSignal={collapseSignal}
              >
                {item.children && renderTree(item.children, level + 1, nodeKey)}
              </SidebarDetails>
            );
          }
          
          if (level === 1) {
            const isPraxis = item.title.toLowerCase().includes('praxis') || item.title.toLowerCase().includes('arbeitsmaterial');
            return (
              <SidebarDetails 
                key={nodeKey} 
                title={displayTitle(item.title)} 
                className={styles.navDim}
                icon={isPraxis ? '🛠️' : '📖'}
                isActive={isActive}
                level={level}
                expandSignal={expandSignal}
                collapseSignal={collapseSignal}
              >
                {item.children && renderTree(item.children, level + 1, nodeKey)}
              </SidebarDetails>
            );
          }

          // Level 2+ (Modules)
          return (
            <SidebarDetails 
              key={nodeKey} 
              title={displayTitle(item.title)} 
              className={styles.navMod}
              isActive={isActive}
              level={level}
              expandSignal={expandSignal}
              collapseSignal={collapseSignal}
            >
              {item.children && renderTree(item.children, level + 1, nodeKey)}
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
        <div className={styles.sidebarControls}>
          <button onClick={expandAll} title={lang === 'en' ? 'Expand all' : 'Alles ausklappen'} aria-label={lang === 'en' ? 'Expand all' : 'Alles ausklappen'} className={styles.controlBtn}>
            <span className={styles.controlIcon}>▼</span> {lang === 'en' ? 'Expand all' : 'Alles ausklappen'}
          </button>
          <button onClick={collapseAll} title={lang === 'en' ? 'Collapse all' : 'Alles einklappen'} aria-label={lang === 'en' ? 'Collapse all' : 'Alles einklappen'} className={styles.controlBtn}>
            <span className={styles.controlIcon}>▶</span> {lang === 'en' ? 'Collapse all' : 'Alles einklappen'}
          </button>
        </div>
        <nav className={styles.sidebarNav}>
          {renderTree(nav)}
        </nav>
      </aside>
    </>
  );
}
