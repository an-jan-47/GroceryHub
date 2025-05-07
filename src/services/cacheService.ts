
/**
 * Simple cache service with expiration
 * In a production environment, consider using a more robust solution
 */

export interface CacheItem<T> {
  value: T;
  expiry: number;
}

const CACHE_PREFIX = 'app_cache:';
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Set a value in cache with expiration
 * @param key Cache key
 * @param value Value to cache
 * @param ttl Time to live in milliseconds
 */
export const setCache = <T>(key: string, value: T, ttl: number = DEFAULT_TTL): void => {
  const cacheKey = `${CACHE_PREFIX}${key}`;
  const now = Date.now();
  
  const item: CacheItem<T> = {
    value,
    expiry: now + ttl
  };
  
  try {
    localStorage.setItem(cacheKey, JSON.stringify(item));
  } catch (error) {
    console.error(`Error setting cache item ${key}:`, error);
    // Clear some old cache entries if storage is full
    clearOldCacheEntries();
  }
};

/**
 * Get a value from cache if it exists and hasn't expired
 * @param key Cache key
 * @returns The cached value or null if not found or expired
 */
export const getCache = <T>(key: string): T | null => {
  const cacheKey = `${CACHE_PREFIX}${key}`;
  const now = Date.now();
  
  try {
    const item = localStorage.getItem(cacheKey);
    if (!item) return null;
    
    const parsedItem: CacheItem<T> = JSON.parse(item);
    
    // Check if the item has expired
    if (parsedItem.expiry < now) {
      localStorage.removeItem(cacheKey);
      return null;
    }
    
    return parsedItem.value;
  } catch (error) {
    console.error(`Error getting cache item ${key}:`, error);
    return null;
  }
};

/**
 * Remove an item from cache
 * @param key Cache key
 */
export const removeCache = (key: string): void => {
  const cacheKey = `${CACHE_PREFIX}${key}`;
  localStorage.removeItem(cacheKey);
};

/**
 * Clear all cache entries
 */
export const clearCache = (): void => {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith(CACHE_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
};

/**
 * Clear expired cache entries
 */
export const clearExpiredCache = (): void => {
  const now = Date.now();
  const keys = Object.keys(localStorage);
  
  keys.forEach(key => {
    if (key.startsWith(CACHE_PREFIX)) {
      try {
        const item = localStorage.getItem(key);
        if (item) {
          const parsedItem = JSON.parse(item);
          if (parsedItem.expiry < now) {
            localStorage.removeItem(key);
          }
        }
      } catch (error) {
        console.error(`Error processing cache item ${key}:`, error);
        localStorage.removeItem(key);
      }
    }
  });
};

/**
 * Clear oldest cache entries to free up space
 */
export const clearOldCacheEntries = (): void => {
  try {
    const keys = Object.keys(localStorage).filter(key => key.startsWith(CACHE_PREFIX));
    const cacheItems: { key: string; expiry: number }[] = [];
    
    keys.forEach(key => {
      try {
        const item = localStorage.getItem(key);
        if (item) {
          const parsedItem = JSON.parse(item);
          cacheItems.push({
            key,
            expiry: parsedItem.expiry
          });
        }
      } catch (error) {
        localStorage.removeItem(key);
      }
    });
    
    // Sort by expiry (oldest first) and remove the oldest 10 items
    cacheItems.sort((a, b) => a.expiry - b.expiry);
    cacheItems.slice(0, 10).forEach(item => {
      localStorage.removeItem(item.key);
    });
  } catch (error) {
    console.error('Error clearing old cache entries:', error);
  }
};
