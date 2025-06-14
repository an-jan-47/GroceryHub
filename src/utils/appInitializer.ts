
import { toast } from "@/components/ui/sonner";

/**
 * Initialize application services
 */
export const initializeApp = (): void => {
  console.info('Initializing application services...');
  
  // Only register service worker in production
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js').catch(error => {
        console.error('Service worker registration failed:', error);
      });
    });
  } else if ('serviceWorker' in navigator) {
    // In development, ensure service workers are unregistered
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for (const registration of registrations) {
        registration.unregister();
      }
    });
  }
  
  // Setup global error handling
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    
    // Don't show error toasts for network issues, which are already handled by React Query
    if (event.error && !event.error.toString().includes('Network Error')) {
      toast("Something went wrong", {
        description: "An unexpected error occurred. Please try again later."
      });
    }
  });
  
  // Handle promise rejections that aren't caught
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    if (event.reason && !event.reason.toString().includes('Network Error')) {
      toast("Something went wrong", {
        description: "An unexpected error occurred. Please try again later."
      });
    }
  });
  
  console.info('Application services initialized successfully');
};

/**
 * Set up performance monitoring
 */
export const setupPerformanceMonitoring = (): void => {
  if (!window.performance || !window.PerformanceObserver) {
    return;
  }
  
  try {
    // Track page load performance metrics
    const observer = new PerformanceObserver((list) => {
      const perfEntries = list.getEntries();
      
      perfEntries.forEach(entry => {
        if (entry.entryType === 'navigation') {
          const navigationEntry = entry as PerformanceNavigationTiming;
          const loadTime = navigationEntry.loadEventEnd - navigationEntry.startTime;
          
          console.log(`Page load completed in ${loadTime.toFixed(2)}ms`);
          
          // Track page load time to analytics service
          // trackPerformanceMetric('page_load_time', loadTime);
        }
      });
    });
    
    // Register observer for navigation timing
    observer.observe({
      type: 'navigation',
      buffered: true
    });
    
    // Register observer for long-running tasks
    const longTaskObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        if (entry.duration > 100) {
          console.warn(`Long task detected: ${entry.duration.toFixed(2)}ms`);
          // trackPerformanceMetric('long_task', entry.duration);
        }
      });
    });
    
    longTaskObserver.observe({ type: 'longtask', buffered: true });
    
  } catch (error) {
    console.error('Error setting up performance monitoring:', error);
  }
};
