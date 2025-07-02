
export interface AppConfig {
  apiUrl: string;
  environment: 'development' | 'production' | 'testing';
  features: {
    [key: string]: boolean;
  };
}

const defaultConfig: AppConfig = {
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  environment: (process.env.NODE_ENV as AppConfig['environment']) || 'development',
  features: {
    enablePushNotifications: true,
    enableAnalytics: false,
  },
};

export function initializeApp(): Promise<AppConfig> {
  return new Promise((resolve) => {
    // Initialize app configuration
    const config = { ...defaultConfig };
    
    // Load environment-specific settings
    if (typeof window !== 'undefined') {
      const envConfig = (window as any).__APP_CONFIG__ || {};
      Object.keys(envConfig).forEach((key: string) => {
        if (key in config) {
          (config as any)[key] = envConfig[key];
        }
      });
    }
    
    resolve(config);
  });
}

export function setupPerformanceMonitoring(): void {
  // Basic performance monitoring setup
  if (typeof window !== 'undefined' && 'performance' in window) {
    // Log initial page load time
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      console.log(`Page loaded in ${loadTime.toFixed(2)}ms`);
    });
  }
}
