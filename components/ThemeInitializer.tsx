'use client';

import { useEffect, useLayoutEffect } from 'react';
import { getStoredTheme, applyTheme } from '@/lib/theme-manager';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export default function ThemeInitializer() {
  useIsomorphicLayoutEffect(() => {
    try {
      const saved = getStoredTheme();
      applyTheme(saved);
    } catch {}
  }, []);

  return null;
}

