'use client'

import { useEffect } from 'react';
import { useCacheSync } from '@/utils/cache-sync';

export default function CacheProvider({ children }: { children: React.ReactNode }) {
  const cleanup = useCacheSync();

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return <>{children}</>;
}
