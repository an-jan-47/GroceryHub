
import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

interface InternetConnectionCheckerProps {
  children: React.ReactNode;
}

const InternetConnectionChecker: React.FC<InternetConnectionCheckerProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isChecking, setIsChecking] = useState(true);
  const [lastCheckTime, setLastCheckTime] = useState(Date.now());

  const checkInternetConnection = async () => {
    setIsChecking(true);
    try {
      // Multiple fallback URLs for better reliability
      const testUrls = [
        'https://www.google.com/favicon.ico',
        'https://cloudflare.com/favicon.ico',
        'https://github.com/favicon.ico'
      ];
      
      let isConnected = false;
      
      for (const url of testUrls) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          await fetch(url, {
            mode: 'no-cors',
            cache: 'no-store',
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          isConnected = true;
          break;
        } catch (error) {
          continue;
        }
      }
      
      setIsOnline(isConnected);
      setLastCheckTime(Date.now());
    } catch (error) {
      console.error('Connection check failed:', error);
      setIsOnline(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Initial connection check
    checkInternetConnection();

    // Set up network event listeners
    const handleOnline = () => {
      setIsOnline(true);
      checkInternetConnection();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsChecking(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic connection check every 30 seconds when offline
    const connectionCheckInterval = setInterval(() => {
      if (!isOnline || Date.now() - lastCheckTime > 30000) {
        checkInternetConnection();
      }
    }, 30000);

    // Check connection when tab becomes visible (for mobile devices)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && (!isOnline || Date.now() - lastCheckTime > 10000)) {
        checkInternetConnection();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(connectionCheckInterval);
    };
  }, [isOnline, lastCheckTime]);

  if (!isOnline) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold text-blue-900 mb-8">GroceryHub</h1>
          
          <div className="bg-gray-50 rounded-2xl p-8 shadow-lg">
            <WifiOff className="w-20 h-20 text-gray-400 mx-auto mb-6" />
            
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              No Internet Connection
            </h2>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              Please check your internet connection and try again. Make sure you're connected to Wi-Fi or have mobile data enabled.
            </p>
            
            <div className="space-y-4">
              <button
                onClick={checkInternetConnection}
                disabled={isChecking}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-5 h-5 ${isChecking ? 'animate-spin' : ''}`} />
                {isChecking ? 'Checking...' : 'Retry Connection'}
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors"
              >
                Reload App
              </button>
            </div>
          </div>
          
          <div className="mt-6 text-sm text-gray-500">
            <p>Troubleshooting tips:</p>
            <ul className="mt-2 space-y-1 text-left">
              <li>• Check your Wi-Fi or mobile data connection</li>
              <li>• Try turning airplane mode on and off</li>
              <li>• Make sure you have a stable internet connection</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default InternetConnectionChecker;
