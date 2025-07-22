/**
 * Service for monitoring application performance
 */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
}

const METRICS_STORAGE_KEY = 'app_performance_metrics';
const METRICS_LIMIT = 100; // Limit stored metrics to prevent localStorage overflow

/**
 * Record a performance metric
 * @param name Metric name
 * @param value Metric value (usually time in ms)
 */
export const recordMetric = (name: string, value: number): void => {
  try {
    const timestamp = Date.now();
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp
    };
    
    let metrics: PerformanceMetric[] = [];
    const storedMetrics = localStorage.getItem(METRICS_STORAGE_KEY);
    
    if (storedMetrics) {
      metrics = JSON.parse(storedMetrics);
    }
    
    metrics.push(metric);
    
    // Keep only the most recent metrics
    if (metrics.length > METRICS_LIMIT) {
      metrics = metrics.slice(metrics.length - METRICS_LIMIT);
    }
    
    localStorage.setItem(METRICS_STORAGE_KEY, JSON.stringify(metrics));
    
    // Optionally send metrics to analytics service
    // This would be implemented in a production environment
  } catch (error) {
    console.error('Error recording performance metric:', error);
  }
};

/**
 * Measure execution time of a function
 * @param fn Function to measure
 * @param metricName Name to use for the metric
 * @returns The function result
 */
export function measurePerformance<T>(fn: () => T, metricName: string): T {
  const start = performance.now();
  try {
    return fn();
  } finally {
    const end = performance.now();
    recordMetric(metricName, end - start);
  }
}

/**
 * Create an async function that measures performance
 * @param fn Async function to measure
 * @param metricName Name to use for the metric
 * @returns Promise with the function result
 */
export async function measureAsyncPerformance<T>(fn: () => Promise<T>, metricName: string): Promise<T> {
  const start = performance.now();
  try {
    return await fn();
  } finally {
    const end = performance.now();
    recordMetric(metricName, end - start);
  }
}

/**
 * Get performance metrics for analysis
 * @param name Optional metric name filter
 * @param since Optional timestamp to filter metrics after a specific time
 * @returns Array of metrics matching the filters
 */
export const getMetrics = (name?: string, since?: number): PerformanceMetric[] => {
  try {
    const storedMetrics = localStorage.getItem(METRICS_STORAGE_KEY);
    if (!storedMetrics) return [];
    
    let metrics: PerformanceMetric[] = JSON.parse(storedMetrics);
    
    if (name) {
      metrics = metrics.filter(metric => metric.name === name);
    }
    
    if (since) {
      metrics = metrics.filter(metric => metric.timestamp >= since);
    }
    
    return metrics;
  } catch (error) {
    console.error('Error getting performance metrics:', error);
    return [];
  }
};

/**
 * Calculate average metric value
 * @param name Metric name
 * @param since Optional timestamp to filter metrics after a specific time
 * @returns Average value or null if no metrics found
 */
export const getAverageMetric = (name: string, since?: number): number | null => {
  const metrics = getMetrics(name, since);
  
  if (metrics.length === 0) return null;
  
  const sum = metrics.reduce((acc, metric) => acc + metric.value, 0);
  return sum / metrics.length;
};

/**
 * Clear stored metrics
 */
export const clearMetrics = (): void => {
  localStorage.removeItem(METRICS_STORAGE_KEY);
};
