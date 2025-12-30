/**
 * 💾 Sistema de Cache em Memória - Elevare
 * Features: TTL, Namespaces, Statistics, Auto-cleanup
 */

import { logger } from "./logger";

// ==================== TYPES ====================

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  createdAt: number;
  hits: number;
}

interface CacheStats {
  totalEntries: number;
  totalHits: number;
  totalMisses: number;
  hitRate: number;
  memoryUsage: string;
  oldestEntry: string | null;
  newestEntry: string | null;
}

interface CacheOptions {
  /** Time to live in milliseconds */
  ttl?: number;
  /** Namespace for grouping related cache entries */
  namespace?: string;
}

type CacheNamespace = "user" | "ai" | "analytics" | "content" | "general";

// ==================== CONFIG ====================

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
const CLEANUP_INTERVAL = 60 * 1000; // 1 minute
const MAX_ENTRIES = 10000;

// ==================== CACHE STORE ====================

class CacheStore {
  private store = new Map<string, CacheEntry<unknown>>();
  private stats = { hits: 0, misses: 0 };
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.startCleanup();
  }

  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, CLEANUP_INTERVAL);

    // Don't prevent Node from exiting
    if (this.cleanupTimer.unref) {
      this.cleanupTimer.unref();
    }
  }

  private cleanup(): void {
    const now = Date.now();
    let removed = 0;
    const keysToDelete: string[] = [];

    this.store.forEach((entry, key) => {
      if (entry.expiresAt < now) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => {
      this.store.delete(key);
      removed++;
    });

    if (removed > 0) {
      logger.debug("Cache cleanup", { removed, remaining: this.store.size });
    }
  }

  private buildKey(key: string, namespace?: string): string {
    return namespace ? `${namespace}:${key}` : key;
  }

  /**
   * Get a value from cache
   */
  get<T>(key: string, options?: CacheOptions): T | undefined {
    const fullKey = this.buildKey(key, options?.namespace);
    const entry = this.store.get(fullKey) as CacheEntry<T> | undefined;

    if (!entry) {
      this.stats.misses++;
      return undefined;
    }

    if (entry.expiresAt < Date.now()) {
      this.store.delete(fullKey);
      this.stats.misses++;
      return undefined;
    }

    entry.hits++;
    this.stats.hits++;
    return entry.value;
  }

  /**
   * Set a value in cache
   */
  set<T>(key: string, value: T, options?: CacheOptions): void {
    // Prevent memory overflow
    if (this.store.size >= MAX_ENTRIES) {
      this.evictOldest();
    }

    const fullKey = this.buildKey(key, options?.namespace);
    const ttl = options?.ttl ?? DEFAULT_TTL;
    const now = Date.now();

    this.store.set(fullKey, {
      value,
      expiresAt: now + ttl,
      createdAt: now,
      hits: 0,
    });
  }

  /**
   * Get or set pattern - fetch from cache or compute and store
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T> {
    const cached = this.get<T>(key, options);
    if (cached !== undefined) {
      return cached;
    }

    const value = await fetcher();
    this.set(key, value, options);
    return value;
  }

  /**
   * Delete a specific key
   */
  delete(key: string, options?: CacheOptions): boolean {
    const fullKey = this.buildKey(key, options?.namespace);
    return this.store.delete(fullKey);
  }

  /**
   * Delete all keys matching a pattern (namespace)
   */
  deleteByNamespace(namespace: string): number {
    const prefix = `${namespace}:`;
    let deleted = 0;
    const keysToDelete: string[] = [];

    this.store.forEach((_, key) => {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => {
      this.store.delete(key);
      deleted++;
    });

    logger.info("Cache namespace cleared", { namespace, deleted });
    return deleted;
  }

  /**
   * Clear all cache
   */
  clear(): void {
    const count = this.store.size;
    this.store.clear();
    this.stats = { hits: 0, misses: 0 };
    logger.info("Cache cleared", { entriesRemoved: count });
  }

  /**
   * Check if key exists (and is not expired)
   */
  has(key: string, options?: CacheOptions): boolean {
    return this.get(key, options) !== undefined;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const entries = Array.from(this.store.entries());
    const totalHits = this.stats.hits;
    const totalMisses = this.stats.misses;
    const total = totalHits + totalMisses;

    let oldest: [string, CacheEntry<unknown>] | null = null;
    let newest: [string, CacheEntry<unknown>] | null = null;

    for (const entry of entries) {
      if (!oldest || entry[1].createdAt < oldest[1].createdAt) {
        oldest = entry;
      }
      if (!newest || entry[1].createdAt > newest[1].createdAt) {
        newest = entry;
      }
    }

    // Rough memory estimation
    const jsonSize = JSON.stringify(Array.from(this.store.entries())).length;
    const memoryMB = (jsonSize / (1024 * 1024)).toFixed(2);

    return {
      totalEntries: this.store.size,
      totalHits,
      totalMisses,
      hitRate: total > 0 ? Math.round((totalHits / total) * 100) : 0,
      memoryUsage: `~${memoryMB}MB`,
      oldestEntry: oldest ? oldest[0] : null,
      newestEntry: newest ? newest[0] : null,
    };
  }

  /**
   * Evict oldest entries when cache is full
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime: number = Infinity;

    this.store.forEach((entry, key) => {
      if (entry.createdAt < oldestTime) {
        oldestKey = key;
        oldestTime = entry.createdAt;
      }
    });

    if (oldestKey) {
      this.store.delete(oldestKey);
      logger.debug("Cache eviction", { key: oldestKey });
    }
  }

  /**
   * Stop cleanup timer (for graceful shutdown)
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }
}

// ==================== SINGLETON INSTANCE ====================

export const cache = new CacheStore();

// ==================== NAMESPACED HELPERS ====================

/**
 * Create a namespaced cache helper
 * @example
 * const userCache = createNamespacedCache('user');
 * const profile = await userCache.getOrSet('profile:123', fetchProfile, 5 * 60 * 1000);
 */
export function createNamespacedCache(namespace: CacheNamespace) {
  return {
    get: <T>(key: string): T | undefined => cache.get<T>(key, { namespace }),
    set: <T>(key: string, value: T, ttl?: number): void => 
      cache.set(key, value, { namespace, ttl }),
    getOrSet: <T>(key: string, fetcher: () => Promise<T>, ttl?: number): Promise<T> =>
      cache.getOrSet(key, fetcher, { namespace, ttl }),
    delete: (key: string): boolean => cache.delete(key, { namespace }),
    clear: (): number => cache.deleteByNamespace(namespace),
  };
}

// ==================== PRE-CONFIGURED CACHES ====================

export const userCache = createNamespacedCache("user");
export const aiCache = createNamespacedCache("ai");
export const analyticsCache = createNamespacedCache("analytics");
export const contentCache = createNamespacedCache("content");

// ==================== CACHE DECORATOR ====================

/**
 * Decorator for caching method results
 * @example
 * @cached('user', 5 * 60 * 1000)
 * async getUserProfile(userId: number) { ... }
 */
export function cached(namespace: CacheNamespace, ttl: number = DEFAULT_TTL) {
  return function (
    _target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const key = `${propertyKey}:${JSON.stringify(args)}`;
      return cache.getOrSet(key, () => originalMethod.apply(this, args), { namespace, ttl });
    };

    return descriptor;
  };
}
