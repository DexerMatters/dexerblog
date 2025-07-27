'use client'

import { api } from './interfaces';

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  version: string;
  expiry: number;
}

interface CacheConfig {
  ttl?: number;
  version?: string;
  forceRefresh?: boolean;
}

class CacheManager {
  private readonly PREFIX = 'dexerblog_cache_';
  private readonly DEFAULT_TTL = 5 * 60 * 1000;
  private readonly VERSION_KEY = 'cache_version';
  private readonly MAX_CACHE_SIZE = 5 * 1024 * 1024;
  private readonly CLEANUP_THRESHOLD = 0.8;
  private readonly pendingRequests = new Map<string, Promise<any>>();

  private getStorageKey(key: string): string {
    return `${this.PREFIX}${key}`;
  }

  private getCurrentVersion(): string {
    return localStorage.getItem(this.VERSION_KEY) || '1.0.0';
  }

  private setVersion(version: string): void {
    localStorage.setItem(this.VERSION_KEY, version);
  }

  private isValidEntry<T>(entry: CacheEntry<T>, version?: string): boolean {
    const now = Date.now();
    const versionToCheck = version || this.getCurrentVersion();
    return entry.timestamp + entry.expiry > now && entry.version === versionToCheck;
  }

  private getCacheSize(): number {
    return Object.keys(localStorage)
      .filter(key => key.startsWith(this.PREFIX))
      .reduce((size, key) => {
        const item = localStorage.getItem(key);
        return size + (item ? item.length : 0);
      }, 0);
  }

  private cleanupOldEntries(): void {
    const cacheKeys = Object.keys(localStorage)
      .filter(key => key.startsWith(this.PREFIX))
      .map(key => {
        const item = localStorage.getItem(key);
        if (!item) return null;
        try {
          const entry = JSON.parse(item);
          return { key, timestamp: entry.timestamp, size: item.length };
        } catch {
          return { key, timestamp: 0, size: item.length };
        }
      })
      .filter(Boolean)
      .sort((a, b) => a!.timestamp - b!.timestamp);

    let cleanedSize = 0;
    const targetSize = this.MAX_CACHE_SIZE * (1 - this.CLEANUP_THRESHOLD);

    for (const entry of cacheKeys) {
      if (cleanedSize >= targetSize) break;
      localStorage.removeItem(entry!.key);
      cleanedSize += entry!.size;
    }
  }

  set<T>(key: string, data: T, config: CacheConfig = {}): void {
    const ttl = config.ttl || this.DEFAULT_TTL;
    const version = config.version || this.getCurrentVersion();

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      version,
      expiry: ttl
    };

    try {
      const serialized = JSON.stringify(entry);

      if (this.getCacheSize() + serialized.length > this.MAX_CACHE_SIZE) {
        this.cleanupOldEntries();
      }

      localStorage.setItem(this.getStorageKey(key), serialized);
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        this.cleanupOldEntries();
        try {
          localStorage.setItem(this.getStorageKey(key), JSON.stringify(entry));
        } catch {
          console.warn('Cache storage quota exceeded after cleanup');
        }
      } else {
        console.warn('Cache storage failed:', error);
      }
    }
  }

  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.getStorageKey(key));
      if (!item) return null;

      const entry: CacheEntry<T> = JSON.parse(item);
      if (this.isValidEntry(entry)) {
        return entry.data;
      }

      this.remove(key);
      return null;
    } catch (error) {
      console.warn('Cache retrieval failed:', error);
      this.remove(key);
      return null;
    }
  }

  remove(key: string): void {
    localStorage.removeItem(this.getStorageKey(key));
  }

  clear(): void {
    const keys = Object.keys(localStorage).filter(key => key.startsWith(this.PREFIX));
    keys.forEach(key => localStorage.removeItem(key));
  }

  invalidateByPattern(pattern: string): void {
    const keys = Object.keys(localStorage).filter(key =>
      key.startsWith(this.PREFIX) && key.includes(pattern)
    );
    keys.forEach(key => localStorage.removeItem(key));
  }

  updateVersion(newVersion: string): void {
    this.setVersion(newVersion);
    this.clear();
  }

  getPendingRequest<T>(key: string): Promise<T> | null {
    return this.pendingRequests.get(key) || null;
  }

  setPendingRequest<T>(key: string, promise: Promise<T>): void {
    this.pendingRequests.set(key, promise);
    promise.finally(() => {
      this.pendingRequests.delete(key);
    });
  }
}

const cacheManager = new CacheManager();

export async function cachedFetch<T = any>(
  endpoint: string,
  config: CacheConfig = {}
): Promise<T> {
  const cacheKey = endpoint.replace(/[?&]/g, '_');

  if (!config.forceRefresh) {
    const cached = cacheManager.get<T>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const pending = cacheManager.getPendingRequest<T>(cacheKey);
    if (pending) {
      return pending;
    }
  }

  const fetchPromise = (async () => {
    try {
      const response = await fetch(api(endpoint));
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: T = await response.json();
      cacheManager.set(cacheKey, data, config);
      return data;
    } catch (error) {
      const cached = cacheManager.get<T>(cacheKey);
      if (cached !== null) {
        console.warn('Fetch failed, using stale cache:', error);
        return cached;
      }

      if (error instanceof Error && error.message.includes('NetworkError')) {
        throw new Error('Network error - please check your connection');
      }
      throw error;
    }
  })();

  if (!config.forceRefresh) {
    cacheManager.setPendingRequest(cacheKey, fetchPromise);
  }

  return fetchPromise;
}

export async function cachedFetchText(
  endpoint: string,
  config: CacheConfig = {}
): Promise<string> {
  const cacheKey = `text_${endpoint.replace(/[?&]/g, '_')}`;

  if (!config.forceRefresh) {
    const cached = cacheManager.get<string>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const pending = cacheManager.getPendingRequest<string>(cacheKey);
    if (pending) {
      return pending;
    }
  }

  const fetchPromise = (async () => {
    try {
      const response = await fetch(api(endpoint));
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.text();
      cacheManager.set(cacheKey, data, config);
      return data;
    } catch (error) {
      const cached = cacheManager.get<string>(cacheKey);
      if (cached !== null) {
        console.warn('Fetch failed, using stale cache:', error);
        return cached;
      }
      throw error;
    }
  })();

  if (!config.forceRefresh) {
    cacheManager.setPendingRequest(cacheKey, fetchPromise);
  }

  return fetchPromise;
}

export function invalidateCache(pattern?: string): void {
  if (pattern) {
    cacheManager.invalidateByPattern(pattern);
  } else {
    cacheManager.clear();
  }
}

export function invalidateDocumentCache(documentTitle?: string): void {
  if (documentTitle) {
    cacheManager.invalidateByPattern(`documents_title=${encodeURIComponent(documentTitle)}`);
    cacheManager.invalidateByPattern(`text_content`);
  } else {
    cacheManager.invalidateByPattern('documents');
    cacheManager.invalidateByPattern('text_content');
  }
}

export function invalidateCategoryCache(categoryTitle?: string): void {
  if (categoryTitle) {
    cacheManager.invalidateByPattern(`categories_title=${encodeURIComponent(categoryTitle)}`);
    cacheManager.invalidateByPattern(`subcategories_title=${encodeURIComponent(categoryTitle)}`);
    cacheManager.invalidateByPattern(`navigation_${encodeURIComponent(categoryTitle)}`);
  } else {
    cacheManager.invalidateByPattern('categories');
    cacheManager.invalidateByPattern('subcategories');
    cacheManager.invalidateByPattern('navigation');
  }
}

export function updateCacheVersion(version: string): void {
  cacheManager.updateVersion(version);
}

export { cacheManager };
