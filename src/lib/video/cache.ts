/**
 * In-Memory TTL Cache System for Video Discovery & Metadata Payload Aggregation
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export const TTL = {
  SEARCH: 15 * 60 * 1000, // 15 minutes
  CHARTS: 60 * 60 * 1000, // 1 hour
  STREAM_URL: 4 * 60 * 60 * 1000, // 4 hours
  METADATA: 24 * 60 * 60 * 1000, // 24 hours
};

export class TTLCache {
  private cache = new Map<string, CacheEntry<unknown>>();

  public set<T>(key: string, value: T, ttlMs: number): void {
    const expiresAt = Date.now() + ttlMs;
    this.cache.set(key, { value, expiresAt });
  }

  public get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  public has(key: string): boolean {
    return this.get(key) !== null;
  }

  public delete(key: string): boolean {
    return this.cache.delete(key);
  }

  public clear(): void {
    this.cache.clear();
  }

  /**
   * Wraps an asynchronous fetch function with TTL caching.
   */
  public async wrap<T>(key: string, ttlMs: number, fetcher: () => Promise<T>): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const fresh = await fetcher();
    this.set(key, fresh, ttlMs);
    return fresh;
  }
}

export const videoCache = new TTLCache();
