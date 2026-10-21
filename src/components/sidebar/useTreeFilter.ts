import { useMemo } from 'react';
import { NavItem } from '@/lib/markdown';

export interface TreeFilterResult {
  filteredItems: NavItem[];
  matchCount: number;
  matchedFolderKeys: Set<string>;
  isFiltering: boolean;
}

function filterBranch(
  items: NavItem[],
  query: string,
  parentKey: string,
  matchedKeys: Set<string>
): { filtered: NavItem[]; count: number } {
  const result: NavItem[] = [];
  let count = 0;

  for (const item of items) {
    const nodeKey = parentKey ? `${parentKey}/${item.title}` : item.title;
    const isLeaf = !!item.slug;
    const titleMatches = item.title.toLowerCase().includes(query);

    if (isLeaf) {
      if (titleMatches) {
        result.push(item);
        count += 1;
      }
    } else if (item.children) {
      const childResult = filterBranch(item.children, query, nodeKey, matchedKeys);
      
      if (titleMatches || childResult.filtered.length > 0) {
        // If the folder itself matches or any of its children match, include it
        result.push({
          ...item,
          children: childResult.filtered.length > 0 ? childResult.filtered : item.children
        });
        
        matchedKeys.add(nodeKey);
        count += (titleMatches && childResult.filtered.length === 0 ? 1 : childResult.count);
      }
    }
  }

  return { filtered: result, count };
}

export function useTreeFilter(items: NavItem[], query: string): TreeFilterResult {
  return useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      return {
        filteredItems: items,
        matchCount: 0,
        matchedFolderKeys: new Set<string>(),
        isFiltering: false
      };
    }

    const matchedFolderKeys = new Set<string>();
    const { filtered, count } = filterBranch(items, trimmed, '', matchedFolderKeys);

    return {
      filteredItems: filtered,
      matchCount: count,
      matchedFolderKeys,
      isFiltering: true
    };
  }, [items, query]);
}
