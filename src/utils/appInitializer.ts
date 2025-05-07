
import { initializeSecurity } from '@/services/securityService';
import { initializeErrorTracking } from '@/utils/errorTracking';
import { clearExpiredCache } from '@/services/cacheService';
import { toast } from '@/components/ui/sonner';

/**
 * Initialize application services and configurations
 */
export const initializeApp = () => {
  console.log('Initializing application services...');
  
  try {
    // Initialize security features
    initializeSecurity();
    
    // Set up error tracking
    initializeErrorTracking();
    
    // Clean up expired cache items
    clearExpiredCache();
    
    // Set up automatic cache cleanup every 5 minutes
    setInterval(() => {
      clearExpiredCache();
    }, 5 * 60 * 1000);
    
    // Set up network status monitoring
    setupNetworkStatusMonitoring();
    
    console.log('Application services initialized successfully');
  } catch (error) {
    console.error('Error initializing application services:', error);
  }
};

/**
 * Set up network status monitoring
 */
const setupNetworkStatusMonitoring = () => {
  // Show toast when the user goes offline
  window.addEventListener('offline', () => {
    toast({
      title: 'You are offline',
      description: 'Please check your internet connection'
    });
  });
  
  // Show toast when the user comes back online
  window.addEventListener('online', () => {
    toast({
      title: 'You are back online',
      description: 'Connected to the internet'
    });
  });
};

/**
 * Monitor and report application performance metrics
 * This would typically be expanded in a production environment
 */
export const setupPerformanceMonitoring = () => {
  if ('performance' in window && 'getEntriesByType' in performance) {
    // Report navigation timing metrics
    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navEntry) {
      // Log page load metrics
      console.info('Page load performance:', {
        dnsLookup: navEntry.domainLookupEnd - navEntry.domainLookupStart,
        tcpHandshake: navEntry.connectEnd - navEntry.connectStart,
        responseTime: navEntry.responseEnd - navEntry.responseStart,
        domInteractive: navEntry.domInteractive - navEntry.fetchStart,
        domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.fetchStart,
        domComplete: navEntry.domComplete - navEntry.fetchStart,
        loadEvent: navEntry.loadEventEnd - navEntry.loadEventStart,
        totalLoadTime: navEntry.loadEventEnd - navEntry.navigationStart
      });
    }
  }
};
