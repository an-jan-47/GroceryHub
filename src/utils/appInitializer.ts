
import { toast } from "@/components/ui/sonner";

/**
 * Initialize application services
 */
export const initializeApp = async (): Promise<void> => {
  console.info('Initializing application services...');
  
  // Clear any existing service workers that might interfere
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }
    
    // Clear all caches
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
  }
  
  // Clear local storage cache except for auth and cart data
  const keysToKeep = Object.keys(localStorage).filter(key => key.startsWith('sb-')).concat(['groceryHub_cart']);
  const savedData: Record<string, string> = {};
  
  keysToKeep.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) savedData[key] = value;
  });
  
  localStorage.clear();
  
  Object.entries(savedData).forEach(([key, value]) => {
    localStorage.setItem(key, value);
  });
  
  // Register custom service worker only in production for better offline handling
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/'
      });
      
      registration.addEventListener('updatefound', () => {
        console.log('Service worker update found');
      });
      
      console.log('Service worker registered successfully');
    } catch (error) {
      console.error('Service worker registration failed:', error);
    }
  }
  
  // Setup global error handling
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    
    // Don't show error toasts for network issues
    if (event.error && !event.error.toString().includes('Network Error') && !event.error.toString().includes('ERR_INTERNET_DISCONNECTED')) {
      toast("Something went wrong", {
        description: "An unexpected error occurred. Please try again later."
      });
    }
  });
  
  // Handle promise rejections that aren't caught
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    if (event.reason && !event.reason.toString().includes('Network Error') && !event.reason.toString().includes('ERR_INTERNET_DISCONNECTED')) {
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
        }
      });
    });
    
    longTaskObserver.observe({ type: 'longtask', buffered: true });
    
  } catch (error) {
    console.error('Error setting up performance monitoring:', error);
  }
};
