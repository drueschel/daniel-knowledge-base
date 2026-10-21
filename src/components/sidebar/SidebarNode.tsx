import React, { memo } from 'react';
import Link from 'next/link';
import { NavItem } from '@/lib/markdown';
import {
  ChevronIcon,
  FolderIcon,
  BookIcon,
  DocumentIcon,
  VideoIcon,
  ToolIcon,
  SparklesIcon
} from './SidebarIcons';
import styles from './Sidebar.module.css';

interface SidebarNodeProps {
  item: NavItem;
  level: number;
  parentKey: string;
  lang: string;
  pathname: string;
  isOpen: (key: string) => boolean;
  toggle: (key: string) => void;
  isFiltering: boolean;
  matchedFolderKeys: Set<string>;
  onSelectLeaf: () => void;
}

function displayTitle(title: string): string {
  return title
    .replace(/^\d+[\._\s:-]+\s*/, '')
    .replace(/_Summary$/i, '')
    .trim();
}

function countLeaves(item: NavItem): number {
  if (item.slug) return 1;
  if (!item.children) return 0;
  return item.children.reduce((acc, child) => acc + countLeaves(child), 0);
}

function isPalItem(item: NavItem): boolean {
  const t = item.title.toLowerCase();
  const slugJoined = item.slug ? item.slug.join('/').toLowerCase() : '';
  return t.includes('pal') || slugJoined.includes('pal') || t.includes('avatar');
}

export const SidebarNode: React.FC<SidebarNodeProps> = memo(({
  item,
  level,
  parentKey,
  lang,
  pathname,
  isOpen,
  toggle,
  isFiltering,
  matchedFolderKeys,
  onSelectLeaf
}) => {
  const isLeaf = !!item.slug;
  const nodeKey = parentKey ? `${parentKey}/${item.title}` : item.title;
  const cleanLabel = displayTitle(item.title);

  // If we are filtering, auto-open if matched
  const open = isFiltering ? (matchedFolderKeys.has(nodeKey) || isOpen(nodeKey)) : isOpen(nodeKey);

  // Leaf Node (Document link)
  if (isLeaf && item.slug) {
    const url = `/${lang}/${item.slug.join('/')}`;
    const isActive = url === pathname;
    const isPal = isPalItem(item);

    return (
      <li className={styles.treeLeaf} role="none">
        <Link
          href={url}
          className={`${styles.leafLink} ${isActive ? styles.activeLeaf : ''} ${isPal ? styles.palLeaf : ''}`}
          onClick={onSelectLeaf}
          data-active={isActive ? 'true' : 'false'}
          role="treeitem"
          aria-selected={isActive}
        >
          <span className={styles.leafIconSlot}>
            {isPal ? (
              <VideoIcon size={14} className={styles.palIcon} />
            ) : (
              <DocumentIcon size={13} className={styles.docIcon} />
            )}
          </span>
          <span className={styles.leafText}>{cleanLabel}</span>
          {isPal && (
            <span className={styles.palBadge}>
              <SparklesIcon size={10} />
              <span>LIVE</span>
            </span>
          )}
        </Link>
      </li>
    );
  }

  // Folder Node (Category / Dimension / Module)
  const children = item.children || [];
  const leafCount = countLeaves(item);
  const isPraxis = cleanLabel.toLowerCase().includes('praxis') || cleanLabel.toLowerCase().includes('arbeitsmaterial');
  const isCourseLevel = level === 0;

  const handleToggle = () => {
    toggle(nodeKey);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle(nodeKey);
    }
  };

  // Icon for folder level
  const renderFolderIcon = () => {
    if (isCourseLevel) {
      return <BookIcon size={15} className={styles.courseIcon} />;
    }
    if (isPraxis) {
      return <ToolIcon size={14} className={styles.praxisIcon} />;
    }
    return <FolderIcon open={open} size={14} className={styles.folderIcon} />;
  };

  return (
    <li
      className={`${styles.treeFolder} ${isCourseLevel ? styles.courseFolder : ''}`}
      role="none"
    >
      <div
        className={`${styles.folderHeader} ${isCourseLevel ? styles.courseHeader : ''}`}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        role="treeitem"
        aria-expanded={open}
        aria-selected={false}
        tabIndex={0}
      >
        <span className={styles.chevronSlot}>
          <ChevronIcon open={open} size={13} />
        </span>
        <span className={styles.folderIconSlot}>
          {renderFolderIcon()}
        </span>
        <span className={styles.folderTitle}>{cleanLabel}</span>

        {leafCount > 0 && (
          <span className={styles.leafCounter} title={`${leafCount} Dokumente`}>
            {leafCount}
          </span>
        )}
      </div>

      {open && children.length > 0 && (
        <ul
          className={`${styles.subTree} ${level > 0 ? styles.guidedSubTree : ''}`}
          role="group"
        >
          {children.map((child) => (
            <SidebarNode
              key={child.slug ? child.slug.join('/') : `${nodeKey}/${child.title}`}
              item={child}
              level={level + 1}
              parentKey={nodeKey}
              lang={lang}
              pathname={pathname}
              isOpen={isOpen}
              toggle={toggle}
              isFiltering={isFiltering}
              matchedFolderKeys={matchedFolderKeys}
              onSelectLeaf={onSelectLeaf}
            />
          ))}
        </ul>
      )}
    </li>
  );
});

SidebarNode.displayName = 'SidebarNode';
