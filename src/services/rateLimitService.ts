
export class RateLimitService {
  private requests: Map<string, number[]> = new Map();

  isRateLimited(key: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    const timestamps = this.requests.get(key) || [];
    const validTimestamps = timestamps.filter((timestamp: number) => timestamp > windowStart);
    
    this.requests.set(key, validTimestamps);
    
    if (validTimestamps.length >= maxRequests) {
      return true;
    }
    
    validTimestamps.push(now);
    this.requests.set(key, validTimestamps);
    
    return false;
  }

  cleanup(): void {
    const now = Date.now();
    const oneHourAgo = now - 3600000; // 1 hour
    
    for (const [key, timestamps] of this.requests.entries()) {
      const validTimestamps = timestamps.filter((timestamp: number) => timestamp > oneHourAgo);
      if (validTimestamps.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validTimestamps);
      }
    }
  }
}

export const rateLimitService = new RateLimitService();
