import { useSyncExternalStore, useCallback, useMemo } from 'react';
import { NavItem } from '@/lib/markdown';

const STORAGE_KEY = 'dkb_tree_open_nodes_v2';

function findAncestorKeys(items: NavItem[], targetPath: string, parentKey = '', acc: string[] = []): string[] {
  for (const item of items) {
    const nodeKey = parentKey ? `${parentKey}/${item.title}` : item.title;
    if (item.slug) {
      const itemUrl = item.slug.join('/');
      if (targetPath.endsWith(itemUrl)) {
        return acc;
      }
    } else if (item.children) {
      const found = findAncestorKeys(item.children, targetPath, nodeKey, [...acc, nodeKey]);
      if (found.length > 0) return found;
    }
  }
  return [];
}

export function getAllFolderKeys(items: NavItem[], parentKey = ''): string[] {
  let keys: string[] = [];
  for (const item of items) {
    const nodeKey = parentKey ? `${parentKey}/${item.title}` : item.title;
    if (item.children) {
      keys.push(nodeKey);
      keys = keys.concat(getAllFolderKeys(item.children, nodeKey));
    }
  }
  return keys;
}

// React 19 Compliant External Store for LocalStorage
let storeListeners: Array<() => void> = [];

function emitStoreChange() {
  for (const listener of storeListeners) {
    listener();
  }
}

const localStorageStore = {
  subscribe(listener: () => void) {
    storeListeners.push(listener);
    return () => {
      storeListeners = storeListeners.filter(l => l !== listener);
    };
  },
  getSnapshot(): string {
    if (typeof window === 'undefined') return '[]';
    return localStorage.getItem(STORAGE_KEY) || '[]';
  },
  getServerSnapshot(): string {
    return '[]';
  },
  write(keys: string[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
    } catch {
      // Storage unavailable or quota exceeded
    }
    emitStoreChange();
  }
};

export function useTreeState(nav: NavItem[], pathname: string) {
  // Subscribe to storage changes without effects
  const rawStorage = useSyncExternalStore(
    localStorageStore.subscribe,
    localStorageStore.getSnapshot,
    localStorageStore.getServerSnapshot
  );

  const storedKeys = useMemo(() => {
    try {
      const parsed = JSON.parse(rawStorage);
      return new Set<string>(Array.isArray(parsed) ? parsed : []);
    } catch {
      return new Set<string>();
    }
  }, [rawStorage]);

  // Derive active ancestors directly during render (zero cascade)
  const activeAncestors = useMemo(() => findAncestorKeys(nav, pathname), [nav, pathname]);

  const effectiveOpenKeys = useMemo(() => {
    const combined = new Set(storedKeys);
    activeAncestors.forEach(k => combined.add(k));
    return combined;
  }, [storedKeys, activeAncestors]);

  const toggle = useCallback((key: string) => {
    const current = new Set(storedKeys);
    // If the key is currently open (either from storage or active ancestor), closing it removes it
    if (effectiveOpenKeys.has(key)) {
      current.delete(key);
    } else {
      current.add(key);
    }
    localStorageStore.write(Array.from(current));
  }, [storedKeys, effectiveOpenKeys]);

  const expandAll = useCallback((allKeys: string[]) => {
    localStorageStore.write(allKeys);
  }, []);

  const collapseAll = useCallback(() => {
    localStorageStore.write([]);
  }, []);

  const isOpen = useCallback((key: string) => effectiveOpenKeys.has(key), [effectiveOpenKeys]);

  return {
    openKeys: effectiveOpenKeys,
    isOpen,
    toggle,
    expandAll,
    collapseAll
  };
}
