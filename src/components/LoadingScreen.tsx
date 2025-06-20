
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LoadingScreen = () => {
  const { loading: authLoading } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionChecked, setConnectionChecked] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setConnectionChecked(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setConnectionChecked(true);
    };

    // Check connection status immediately
    const checkConnection = async () => {
      try {
        const response = await fetch('https://www.google.com/favicon.ico', {
          mode: 'no-cors',
          cache: 'no-store',
        });
        setIsOnline(true);
      } catch (error) {
        setIsOnline(false);
      } finally {
        setConnectionChecked(true);
      }
    };

    checkConnection();
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set up periodic connection check
    const connectionCheckInterval = setInterval(checkConnection, 10000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(connectionCheckInterval);
    };
  }, []);

  useEffect(() => {
    if (!authLoading && isOnline && connectionChecked) {
      // Delay navigation slightly to ensure smooth transition
      const timer = setTimeout(() => {
        navigate('/', { replace: true });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [authLoading, isOnline, connectionChecked, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <h1 className="text-3xl font-bold text-blue-900 mb-2">GroceryHub</h1>
      <RefreshCw className="animate-spin w-8 h-8 text-gray-600" />
      <p className="mt-4 text-gray-500">Loading...</p>
    </div>
  );
};

export default LoadingScreen;
