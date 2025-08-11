
import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

interface InternetConnectionCheckerProps {
  children: React.ReactNode;
}

const InternetConnectionChecker: React.FC<InternetConnectionCheckerProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(true); // Start as true to avoid flash
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState(Date.now());
  const [hasInitialized, setHasInitialized] = useState(false);

  const checkInternetConnection = async (): Promise<boolean> => {
    setIsChecking(true);
    
    try {
      // Use a simple request to check connectivity
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch('/?_=' + Date.now(), {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-store',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      setLastCheckTime(Date.now());
      return true;
    } catch (error) {
      // Fallback check with Google DNS
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        await fetch('https://8.8.8.8', {
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-store',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        setLastCheckTime(Date.now());
        return true;
      } catch (fallbackError) {
        console.log('Internet connection check failed');
        return false;
      }
    } finally {
      setIsChecking(false);
    }
  };

  const updateConnectionStatus = async () => {
    const connectionStatus = await checkInternetConnection();
    setIsOnline(connectionStatus);
    setHasInitialized(true);
  };

  useEffect(() => {
    // Initial connection check
    updateConnectionStatus();

    // Set up network event listeners
    const handleOnline = () => {
      console.log('Browser detected online');
      setIsOnline(true);
      updateConnectionStatus();
    };

    const handleOffline = () => {
      console.log('Browser detected offline');
      setIsOnline(false);
      setHasInitialized(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic connection check every 15 seconds when offline
    const connectionCheckInterval = setInterval(() => {
      if (!isOnline || Date.now() - lastCheckTime > 15000) {
        updateConnectionStatus();
      }
    }, 15000);

    // Check connection when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateConnectionStatus();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Handle page load/reload scenarios
    const handleLoad = () => {
      updateConnectionStatus();
    };

    window.addEventListener('load', handleLoad);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('load', handleLoad);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(connectionCheckInterval);
    };
  }, [isOnline, lastCheckTime]);

  // Show loading state until we've checked connection at least once
  if (!hasInitialized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <h1 className="text-3xl font-bold text-blue-900 mb-8">GroceryHub</h1>
        <div className="flex flex-col items-center">
          <RefreshCw className="animate-spin w-8 h-8 text-gray-600 mb-4" />
          <p className="text-gray-500">Checking connection...</p>
        </div>
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
        <div className="text-center max-w-md w-full">
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
                onClick={updateConnectionStatus}
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
            <ul className="mt-2 space-y-1 text-left list-disc list-inside">
              <li>Check your Wi-Fi or mobile data connection</li>
              <li>Try turning airplane mode on and off</li>
              <li>Make sure you have a stable internet connection</li>
              <li>Try refreshing the page</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default InternetConnectionChecker;
