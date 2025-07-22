/**
 * Error tracking utility for centralized error handling
 */

interface ErrorReport {
  message: string;
  stack?: string;
  context?: Record<string, any>;
  timestamp: number;
  url: string;
  userAgent: string;
}

const ERROR_STORAGE_KEY = 'app_error_reports';
const MAX_STORED_ERRORS = 50;

/**
 * Log and track an error
 * @param error Error object or message
 * @param context Additional context information
 */
export const trackError = (
  error: Error | string,
  context: Record<string, any> = {}
): void => {
  try {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = typeof error === 'string' ? undefined : error.stack;
    
    const errorReport: ErrorReport = {
      message: errorMessage,
      stack: errorStack,
      context,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    
    console.error('Error tracked:', errorReport);
    
    // Store error locally
    storeErrorReport(errorReport);
    
    // In a production environment, send to an error tracking service
    // This would be implemented with a service like Sentry, LogRocket, etc.
  } catch (e) {
    // Fallback error handling to prevent recursive errors
    console.error('Error in error tracking:', e);
  }
};

/**
 * Store error report in local storage
 * @param report Error report to store
 */
const storeErrorReport = (report: ErrorReport): void => {
  try {
    let reports: ErrorReport[] = [];
    const storedReports = localStorage.getItem(ERROR_STORAGE_KEY);
    
    if (storedReports) {
      reports = JSON.parse(storedReports);
    }
    
    reports.push(report);
    
    // Keep only recent reports to prevent storage overflow
    if (reports.length > MAX_STORED_ERRORS) {
      reports = reports.slice(reports.length - MAX_STORED_ERRORS);
    }
    
    localStorage.setItem(ERROR_STORAGE_KEY, JSON.stringify(reports));
  } catch (e) {
    console.error('Error storing error report:', e);
  }
};

/**
 * Get stored error reports
 * @returns Array of error reports
 */
export const getErrorReports = (): ErrorReport[] => {
  try {
    const storedReports = localStorage.getItem(ERROR_STORAGE_KEY);
    if (!storedReports) return [];
    
    return JSON.parse(storedReports);
  } catch (e) {
    console.error('Error getting error reports:', e);
    return [];
  }
};

/**
 * Clear stored error reports
 */
export const clearErrorReports = (): void => {
  localStorage.removeItem(ERROR_STORAGE_KEY);
};

/**
 * Initialize global error tracking
 */
export const initializeErrorTracking = (): void => {
  // Set up global error handler
  const originalOnError = window.onerror;
  window.onerror = (message, source, lineno, colno, error) => {
    trackError(error || String(message), {
      source,
      lineno,
      colno
    });
    
    // Call original handler if it exists
    if (typeof originalOnError === 'function') {
      return originalOnError(message, source, lineno, colno, error);
    }
    
    // Return false to allow default browser error handling
    return false;
  };
  
  // Set up unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    trackError(event.reason || 'Unhandled Promise rejection', {
      promiseRejection: true
    });
  });
};
