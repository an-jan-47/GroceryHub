
/**
 * Simple rate limiting service that uses local storage
 * In a production environment, this would likely use Redis or another distributed cache
 */

const RATE_LIMIT_PREFIX = 'rate_limit:';
const DEFAULT_WINDOW_MS = 60000; // 1 minute
const DEFAULT_MAX_REQUESTS = 60; // 60 requests per minute

/**
 * Check if a request should be rate limited
 * @param key Unique identifier for the rate limit (e.g. 'create_order')
 * @param maxRequests Maximum requests allowed in the time window
 * @param windowMs Time window in milliseconds
 * @returns Boolean indicating if the request should be allowed
 */
export const checkRateLimit = (
  key: string, 
  maxRequests: number = DEFAULT_MAX_REQUESTS, 
  windowMs: number = DEFAULT_WINDOW_MS
): boolean => {
  const storageKey = `${RATE_LIMIT_PREFIX}${key}`;
  const now = Date.now();
  
  try {
    // Get existing rate limit data
    const storedData = localStorage.getItem(storageKey);
    let rateData: { timestamps: number[] } = { timestamps: [] };
    
    if (storedData) {
      rateData = JSON.parse(storedData);
    }
    
    // Filter timestamps to only include those within the current window
    const windowStart = now - windowMs;
    rateData.timestamps = rateData.timestamps.filter(timestamp => timestamp > windowStart);
    
    // Check if we're over the limit
    if (rateData.timestamps.length >= maxRequests) {
      return false; // Rate limited
    }
    
    // Add current timestamp and update storage
    rateData.timestamps.push(now);
    localStorage.setItem(storageKey, JSON.stringify(rateData));
    
    return true; // Request allowed
  } catch (error) {
    console.error('Error checking rate limit:', error);
    return true; // Default to allowing request in case of error
  }
};

/**
 * Reset rate limit for a specific key
 * @param key Unique identifier for the rate limit
 */
export const resetRateLimit = (key: string): void => {
  const storageKey = `${RATE_LIMIT_PREFIX}${key}`;
  localStorage.removeItem(storageKey);
};

/**
 * Get remaining request count for the current time window
 * @param key Unique identifier for the rate limit
 * @param maxRequests Maximum requests allowed in the time window
 * @param windowMs Time window in milliseconds
 * @returns Number of remaining requests allowed in the current window
 */
export const getRemainingRequests = (
  key: string, 
  maxRequests: number = DEFAULT_MAX_REQUESTS, 
  windowMs: number = DEFAULT_WINDOW_MS
): number => {
  const storageKey = `${RATE_LIMIT_PREFIX}${key}`;
  const now = Date.now();
  
  try {
    const storedData = localStorage.getItem(storageKey);
    if (!storedData) {
      return maxRequests;
    }
    
    const rateData = JSON.parse(storedData);
    const windowStart = now - windowMs;
    const validTimestamps = rateData.timestamps.filter(timestamp => timestamp > windowStart);
    
    return Math.max(0, maxRequests - validTimestamps.length);
  } catch (error) {
    console.error('Error getting remaining requests:', error);
    return maxRequests;
  }
};
