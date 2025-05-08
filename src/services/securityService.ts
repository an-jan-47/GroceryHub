import { toast } from '@/components/ui/sonner';

/**
 * Service for handling security concerns in the application
 */

const SECURITY_LOG_KEY = 'security_logs';
const SESSION_ACTIVITY_KEY = 'session_activity';

interface SecurityLog {
  type: string;
  message: string;
  timestamp: number;
  details?: any;
}

/**
 * Log a security event
 * @param type Event type (e.g., 'auth', 'csrf', 'xss')
 * @param message Event description
 * @param details Additional details
 */
export const logSecurityEvent = (type: string, message: string, details?: any): void => {
  try {
    const log: SecurityLog = {
      type,
      message,
      timestamp: Date.now(),
      details
    };
    
    let logs: SecurityLog[] = [];
    const storedLogs = localStorage.getItem(SECURITY_LOG_KEY);
    
    if (storedLogs) {
      logs = JSON.parse(storedLogs);
    }
    
    logs.push(log);
    
    // Keep only the most recent 50 logs
    if (logs.length > 50) {
      logs = logs.slice(logs.length - 50);
    }
    
    localStorage.setItem(SECURITY_LOG_KEY, JSON.stringify(logs));
    
    // In a production environment, critical security events should be sent to a server
    if (type === 'critical') {
      console.error('CRITICAL SECURITY EVENT:', message, details);
    }
  } catch (error) {
    console.error('Error logging security event:', error);
  }
};

/**
 * Sanitize user input to prevent XSS attacks
 * @param input String to sanitize
 * @returns Sanitized string
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Validate a CSRF token
 * @param token CSRF token to validate
 * @returns Boolean indicating if the token is valid
 */
export const validateCsrfToken = (token: string): boolean => {
  const storedToken = localStorage.getItem('csrf_token');
  
  if (!storedToken || token !== storedToken) {
    logSecurityEvent('csrf', 'Invalid CSRF token', { token });
    return false;
  }
  
  return true;
};

/**
 * Generate a new CSRF token
 * @returns New CSRF token
 */
export const generateCsrfToken = (): string => {
  const array = new Uint8Array(16);
  window.crypto.getRandomValues(array);
  const token = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
  
  localStorage.setItem('csrf_token', token);
  return token;
};

/**
 * Record user activity to detect session hijacking
 * @param activityType Type of activity (e.g., 'navigate', 'api_call')
 */
export const recordUserActivity = (activityType: string): void => {
  try {
    const now = Date.now();
    const activity = {
      type: activityType,
      timestamp: now,
      userAgent: navigator.userAgent
    };
    
    let activities = [];
    const storedActivities = localStorage.getItem(SESSION_ACTIVITY_KEY);
    
    if (storedActivities) {
      activities = JSON.parse(storedActivities);
    }
    
    activities.push(activity);
    
    // Keep only recent activities
    if (activities.length > 100) {
      activities = activities.slice(activities.length - 100);
    }
    
    localStorage.setItem(SESSION_ACTIVITY_KEY, JSON.stringify(activities));
    
    // Check for suspicious activity
    checkForSuspiciousActivity(activities);
  } catch (error) {
    console.error('Error recording user activity:', error);
  }
};

/**
 * Check for suspicious activity patterns
 * @param activities Array of user activities
 */
const checkForSuspiciousActivity = (activities: any[]): void => {
  if (activities.length < 2) return;
  
  const lastActivity = activities[activities.length - 1];
  const previousActivity = activities[activities.length - 2];
  
  // Check for sudden user agent change
  if (lastActivity.userAgent !== previousActivity.userAgent) {
    logSecurityEvent('suspicious', 'User agent changed within session', {
      previous: previousActivity.userAgent,
      current: lastActivity.userAgent
    });
    
    // Fixed: Using the correct toast API format
    toast("Security Alert", {
      description: 'Unusual activity detected in your account'
    });
  }
  
  // Check for impossibly quick location changes (would need geolocation)
  // This would be expanded in a production application
};

/**
 * Validate password strength
 * @param password Password to validate
 * @returns Object with validation result and strength score
 */
export const validatePasswordStrength = (password: string): { 
  isValid: boolean; 
  score: number; 
  feedback: string 
} => {
  if (!password) {
    return { isValid: false, score: 0, feedback: 'Password is required' };
  }
  
  let score = 0;
  let feedback = '';
  
  // Length check
  if (password.length < 8) {
    feedback = 'Password should be at least 8 characters';
  } else {
    score += 1;
  }
  
  // Complexity checks
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  
  // Provide feedback based on score
  if (score < 3) {
    feedback = 'Password is weak. Add uppercase letters, numbers, or special characters.';
  } else if (score < 5) {
    feedback = 'Password strength is moderate.';
  } else {
    feedback = 'Password is strong.';
  }
  
  return {
    isValid: score >= 3,
    score,
    feedback
  };
};

/**
 * Initialize security measures for the application
 */
export const initializeSecurity = (): void => {
  // Generate initial CSRF token
  if (!localStorage.getItem('csrf_token')) {
    generateCsrfToken();
  }
  
  // Set security headers (in a real app, these would be set on the server)
  // This is just for demonstration
  document.addEventListener('DOMContentLoaded', () => {
    try {
      // Create a CSP meta tag (this is for illustration - should be set server-side)
      const cspMeta = document.createElement('meta');
      cspMeta.httpEquiv = 'Content-Security-Policy';
      cspMeta.content = "default-src 'self'; img-src * data:; style-src 'self' 'unsafe-inline';";
      document.head.appendChild(cspMeta);
    } catch (error) {
      console.error('Error setting CSP meta tag:', error);
    }
  });
};
