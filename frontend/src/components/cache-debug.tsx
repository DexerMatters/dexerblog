'use client'

import { invalidateCache, invalidateCategoryCache, invalidateDocumentCache } from '@/utils/cache';
import { useState, useEffect } from 'react';

export default function CacheDebug() {
  const [isVisible, setIsVisible] = useState(false);
  const [cacheStats, setCacheStats] = useState<{ keys: number; size: string }>({ keys: 0, size: '0 KB' });

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const updateStats = () => {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('dexerblog_cache_'));
      const totalSize = keys.reduce((acc, key) => {
        const item = localStorage.getItem(key);
        return acc + (item ? item.length : 0);
      }, 0);

      setCacheStats({
        keys: keys.length,
        size: `${(totalSize / 1024).toFixed(2)} KB`
      });
    };

    updateStats();
    const interval = setInterval(updateStats, 5000);
    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white px-3 py-2 rounded text-xs"
      >
        Cache ({cacheStats.keys})
      </button>

      {isVisible && (
        <div className="fixed bottom-16 right-4 z-50 bg-white border border-gray-300 rounded p-4 shadow-lg min-w-48">
          <h3 className="font-bold mb-2">Cache Debug</h3>
          <p className="text-sm mb-2">Items: {cacheStats.keys}</p>
          <p className="text-sm mb-3">Size: {cacheStats.size}</p>

          <div className="space-y-2">
            <button
              onClick={() => invalidateCache()}
              className="block w-full bg-red-500 text-white px-2 py-1 rounded text-xs"
            >
              Clear All
            </button>
            <button
              onClick={() => invalidateCategoryCache()}
              className="block w-full bg-orange-500 text-white px-2 py-1 rounded text-xs"
            >
              Clear Categories
            </button>
            <button
              onClick={() => invalidateDocumentCache()}
              className="block w-full bg-yellow-500 text-white px-2 py-1 rounded text-xs"
            >
              Clear Documents
            </button>
          </div>
        </div>
      )}
    </>
  );
}
