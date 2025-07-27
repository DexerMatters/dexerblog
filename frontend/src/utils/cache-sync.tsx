'use client'

import { cachedFetch, updateCacheVersion } from './cache';

class CacheSyncManager {
  private readonly SYNC_INTERVAL = 30000;
  private readonly VERSION_CHECK_KEY = 'cache_version_check';
  private intervalId: NodeJS.Timeout | null = null;
  private lastKnownVersion: string | null = null;
  private isChecking = false;

  start(): void {
    if (this.intervalId) return;

    this.checkInitialVersion();
    this.intervalId = setInterval(() => {
      this.checkVersion();
    }, this.SYNC_INTERVAL);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async checkInitialVersion(): Promise<void> {
    try {
      const versionData = await cachedFetch<{ version: string }>('cache-version', { ttl: 5000 });
      this.lastKnownVersion = versionData.version;
    } catch (error) {
      console.warn('Failed to check initial cache version:', error);
    }
  }

  private async checkVersion(): Promise<void> {
    if (this.isChecking) return;
    this.isChecking = true;

    try {
      const versionData = await cachedFetch<{ version: string }>('cache-version', {
        ttl: 5000,
        forceRefresh: true
      });

      if (this.lastKnownVersion && versionData.version !== this.lastKnownVersion) {
        console.log('Cache version changed, invalidating cache');
        updateCacheVersion(versionData.version);
        this.lastKnownVersion = versionData.version;

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('cache-invalidated', {
            detail: { version: versionData.version }
          }));
        }
      } else if (!this.lastKnownVersion) {
        this.lastKnownVersion = versionData.version;
      }
    } catch (error) {
      console.warn('Failed to check cache version:', error);
    } finally {
      this.isChecking = false;
    }
  }

  getCurrentVersion(): string | null {
    return this.lastKnownVersion;
  }
}

export const cacheSyncManager = new CacheSyncManager();

export function useCacheSync() {
  if (typeof window !== 'undefined') {
    cacheSyncManager.start();

    return () => {
      cacheSyncManager.stop();
    };
  }
  return () => { };
}
