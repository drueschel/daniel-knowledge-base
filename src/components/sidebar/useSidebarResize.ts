'use client';

import { useState, useRef, useEffect, useCallback, useSyncExternalStore } from 'react';

export const DEFAULT_SIDEBAR_WIDTH = 320;
export const MIN_SIDEBAR_WIDTH = 220;
export const MAX_SIDEBAR_WIDTH = 640;
export const SIDEBAR_STORAGE_KEY = 'dkb_sidebar_width';

const CUSTOM_CHANGE_EVENT = 'dkb_sidebar_width_change';

function subscribeToWidth(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener(CUSTOM_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(CUSTOM_CHANGE_EVENT, callback);
  };
}

function getWidthSnapshot(): number {
  if (typeof window === 'undefined') return DEFAULT_SIDEBAR_WIDTH;
  try {
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (stored) {
      const parsed = parseInt(stored, 10);
      if (!isNaN(parsed) && parsed >= MIN_SIDEBAR_WIDTH && parsed <= MAX_SIDEBAR_WIDTH) {
        return parsed;
      }
    }
  } catch {
    // Ignore
  }
  return DEFAULT_SIDEBAR_WIDTH;
}

function getServerSnapshot(): number {
  return DEFAULT_SIDEBAR_WIDTH;
}

function persistWidth(newWidth: number) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(newWidth));
    window.dispatchEvent(new Event(CUSTOM_CHANGE_EVENT));
  } catch {
    // Ignore
  }
}

/**
 * Custom hook to manage resizable / draggable sidebar width with:
 * - Persistent storage in localStorage via useSyncExternalStore (React 19 clean)
 * - Real-time smooth CSS custom property updates via requestAnimationFrame
 * - Pointer Capture for zero drag loss across iframes & fast mouse movements
 * - W3C ARIA accessibility controls (Keyboard Left/Right arrows, Home, Enter)
 * - Double-click reset to default width
 */
export function useSidebarResize() {
  const storedWidth = useSyncExternalStore(subscribeToWidth, getWidthSnapshot, getServerSnapshot);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(storedWidth);
  const currentWidthRef = useRef<number>(storedWidth);
  const rafIdRef = useRef<number | null>(null);

  // Synchronize CSS variable helper
  const applyWidth = useCallback((w: number) => {
    if (typeof document === 'undefined') return;
    document.documentElement.style.setProperty('--sidebar-width', `${w}px`);
  }, []);

  // Sync initial and external stored changes to CSS variable
  useEffect(() => {
    currentWidthRef.current = storedWidth;
    applyWidth(storedWidth);
  }, [storedWidth, applyWidth]);

  // Clean up any pending animation frames or cursor overrides on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      if (typeof document !== 'undefined') {
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };
  }, []);

  const getMaxAllowedWidth = useCallback(() => {
    if (typeof window === 'undefined') return MAX_SIDEBAR_WIDTH;
    return Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH + 60, Math.floor(window.innerWidth * 0.55)));
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      // Only respond to primary mouse button / touch
      if (e.button !== 0) return;

      e.preventDefault();
      const target = e.currentTarget;
      try {
        target.setPointerCapture(e.pointerId);
      } catch {
        // Fallback if setPointerCapture is unsupported
      }

      startXRef.current = e.clientX;
      startWidthRef.current = currentWidthRef.current;
      setIsDragging(true);

      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      const onPointerMove = (moveEvent: PointerEvent) => {
        const delta = moveEvent.clientX - startXRef.current;
        const targetWidth = startWidthRef.current + delta;
        const maxWidth = getMaxAllowedWidth();
        const clampedWidth = Math.max(MIN_SIDEBAR_WIDTH, Math.min(maxWidth, Math.round(targetWidth)));

        currentWidthRef.current = clampedWidth;

        if (rafIdRef.current !== null) {
          cancelAnimationFrame(rafIdRef.current);
        }
        rafIdRef.current = requestAnimationFrame(() => {
          applyWidth(clampedWidth);
        });
      };

      const onPointerUp = (upEvent: PointerEvent) => {
        try {
          if (target.hasPointerCapture(upEvent.pointerId)) {
            target.releasePointerCapture(upEvent.pointerId);
          }
        } catch {
          // Ignore
        }

        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('pointercancel', onPointerUp);

        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        setIsDragging(false);

        const finalWidth = currentWidthRef.current;
        applyWidth(finalWidth);
        persistWidth(finalWidth);
      };

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerUp);
    },
    [applyWidth, getMaxAllowedWidth]
  );

  const resetToDefault = useCallback(() => {
    currentWidthRef.current = DEFAULT_SIDEBAR_WIDTH;
    applyWidth(DEFAULT_SIDEBAR_WIDTH);
    persistWidth(DEFAULT_SIDEBAR_WIDTH);
  }, [applyWidth]);

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      resetToDefault();
    },
    [resetToDefault]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const step = e.shiftKey ? 40 : 10;
      const maxWidth = getMaxAllowedWidth();

      let targetWidth: number | null = null;

      if (e.key === 'ArrowLeft') {
        targetWidth = Math.max(MIN_SIDEBAR_WIDTH, currentWidthRef.current - step);
      } else if (e.key === 'ArrowRight') {
        targetWidth = Math.min(maxWidth, currentWidthRef.current + step);
      } else if (e.key === 'Home') {
        targetWidth = DEFAULT_SIDEBAR_WIDTH;
      } else if (e.key === 'End') {
        targetWidth = maxWidth;
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        resetToDefault();
        return;
      }

      if (targetWidth !== null) {
        e.preventDefault();
        currentWidthRef.current = targetWidth;
        applyWidth(targetWidth);
        persistWidth(targetWidth);
      }
    },
    [applyWidth, getMaxAllowedWidth, resetToDefault]
  );

  return {
    width: storedWidth,
    isDragging,
    minWidth: MIN_SIDEBAR_WIDTH,
    maxWidth: MAX_SIDEBAR_WIDTH,
    handlePointerDown,
    handleDoubleClick,
    handleKeyDown,
  };
}
