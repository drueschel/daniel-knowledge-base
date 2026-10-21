import { useSyncExternalStore, useCallback, useMemo, useEffect, useRef } from 'react';
import { NavItem } from '@/lib/markdown';

const STORAGE_KEY = 'dkb_tree_open_nodes_v2';

export function findAncestorKeys(items: NavItem[], targetPath: string, parentKey = '', acc: string[] = []): string[] {
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
    if (typeof window === 'undefined') return 'null';
    return localStorage.getItem(STORAGE_KEY) || 'null';
  },
  getServerSnapshot(): string {
    return 'null';
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
  // Subscribe to storage changes without cascading effects
  const rawStorage = useSyncExternalStore(
    localStorageStore.subscribe,
    localStorageStore.getSnapshot,
    localStorageStore.getServerSnapshot
  );

  const storedKeys = useMemo(() => {
    try {
      if (rawStorage === 'null') return null;
      const parsed = JSON.parse(rawStorage);
      return new Set<string>(Array.isArray(parsed) ? parsed : []);
    } catch {
      return null;
    }
  }, [rawStorage]);

  // Track previous pathname to only auto-expand ancestors on route navigation
  const prevPathnameRef = useRef<string | null>(null);

  // When pathname changes (or on initial load with no stored keys), ensure active ancestors are opened
  useEffect(() => {
    if (!pathname) return;

    // Only run if pathname actually changed or if localStorage is completely uninitialized
    const isNewPath = prevPathnameRef.current !== pathname;
    prevPathnameRef.current = pathname;

    const ancestors = findAncestorKeys(nav, pathname);
    if (ancestors.length === 0) return;

    const raw = localStorageStore.getSnapshot();
    let currentKeys: string[] = [];
    let isInitialized = false;

    if (raw !== 'null') {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          currentKeys = parsed;
          isInitialized = true;
        }
      } catch {
        // ignore
      }
    }

    // If it's a first-time visitor (no stored keys), initialize with active ancestors
    if (!isInitialized) {
      localStorageStore.write(ancestors);
      return;
    }

    // If user navigated to a NEW path, ensure the new path's ancestors are open
    if (isNewPath) {
      const currentSet = new Set(currentKeys);
      let changed = false;
      for (const a of ancestors) {
        if (!currentSet.has(a)) {
          currentSet.add(a);
          changed = true;
        }
      }
      if (changed) {
        localStorageStore.write(Array.from(currentSet));
      }
    }
  }, [pathname, nav]);

  // Effective set: if storedKeys is null, compute from ancestors fallback
  const effectiveOpenKeys = useMemo(() => {
    if (storedKeys !== null) {
      return storedKeys;
    }
    // Fallback for SSR / pre-hydration
    const initial = new Set<string>();
    const ancestors = findAncestorKeys(nav, pathname);
    ancestors.forEach(a => initial.add(a));
    return initial;
  }, [storedKeys, nav, pathname]);

  const toggle = useCallback((key: string) => {
    const raw = localStorageStore.getSnapshot();
    let currentKeys: string[] = [];
    if (raw !== 'null') {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) currentKeys = parsed;
      } catch {
        currentKeys = [];
      }
    } else {
      currentKeys = Array.from(effectiveOpenKeys);
    }

    const currentSet = new Set(currentKeys);
    if (currentSet.has(key)) {
      currentSet.delete(key);
    } else {
      currentSet.add(key);
    }
    localStorageStore.write(Array.from(currentSet));
  }, [effectiveOpenKeys]);

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
