
import { useState, useEffect } from 'react';
import { AlertCircle, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LoadingScreen = () => {
  const [dots, setDots] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [retryCount, setRetryCount] = useState(0);
  const [funnyMessage, setFunnyMessage] = useState('');
  
  const funnyMessages = [
    "Looks like your internet took a coffee break!",
    "Houston, we have a connection problem!",
    "404: Internet not found. Have you tried turning it off and on again?",
    "Oops! Your internet seems to be playing hide and seek.",
    "Your WiFi is being shy today."
  ];

  useEffect(() => {
    // Dot animation
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 500);
    
    // Online status check
    const handleStatusChange = () => {
      setIsOnline(navigator.onLine);
      if (!navigator.onLine) {
        setFunnyMessage(funnyMessages[Math.floor(Math.random() * funnyMessages.length)]);
      }
    };

    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);
    
    // Initial check
    handleStatusChange();
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    // Force a connection check
    setIsOnline(navigator.onLine);
    if (navigator.onLine) {
      window.location.reload();
    } else {
      // Show a new funny message on retry
      setFunnyMessage(funnyMessages[Math.floor(Math.random() * funnyMessages.length)]);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50 p-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-blue-500 mb-2">GroceryHub</h1>
        <p className="text-gray-600 mb-6">Where convenience and quality meet</p>
        
        {isOnline ? (
          <>
            <div className="relative h-1.5 w-60 bg-gray-200 rounded-full overflow-hidden mb-4 mx-auto">
              <div className="absolute top-0 h-full bg-blue-500 animate-loading-bar"></div>
            </div>
            <div className="flex items-center justify-center h-6">
              <span className="text-xl text-gray-600">Loading{dots}</span>
            </div>
          </>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center mb-2">
              <WifiOff className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-lg font-medium text-red-700">No internet connection</span>
            </div>
            <p className="text-gray-700 mb-4">{funnyMessage}</p>
            <Button 
              onClick={handleRetry}
              className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Connection
            </Button>
          </div>
        )}
        
        <div className="text-sm text-gray-400 mt-6">
          <div className="flex items-center justify-center">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span>{isOnline ? 'Connected' : 'Offline'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
