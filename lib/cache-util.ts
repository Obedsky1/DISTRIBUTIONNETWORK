/**
 * Simple in-memory cache with TTL support
 */
export interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

export class MemoryCache {
    private cache = new Map<string, CacheEntry<any>>();

    constructor(private defaultTtlMs: number = 5 * 60 * 1000) { }

    set<T>(key: string, data: T, ttlMs?: number): T {
        this.cache.set(key, {
            data,
            timestamp: Date.now() + (ttlMs ?? this.defaultTtlMs),
        });
        return data;
    }

    get<T>(key: string): T | null {
        const entry = this.cache.get(key);
        if (entry && Date.now() < entry.timestamp) {
            return entry.data as T;
        }
        this.cache.delete(key);
        return null;
    }

    delete(key: string): void {
        this.cache.delete(key);
    }

    clear(): void {
        this.cache.clear();
    }
}

// Global instance for simple usage
export const globalCache = new MemoryCache();
