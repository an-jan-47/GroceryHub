import { useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';

export const useNavigationGestures = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const isCapacitor = !!(window as any).Capacitor;

    const setupBackHandler = async () => {
      if (!isCapacitor) return;

      try {
        const { App } = await import('@capacitor/app');

        // Remove any existing listeners to prevent duplicates
        await App.removeAllListeners();

        // Set up back button handler
        App.addListener('backButton', async () => {
          if (location.pathname === '/') {
            const shouldExit = window.confirm('Do you want to exit the app?');
            if (shouldExit) {
              await App.exitApp();
            }
          } else {
            navigate(-1);
          }
        });
      } catch (err) {
        console.error('Capacitor back listener failed:', err);
      }
    };

    setupBackHandler();

    // Cleanup function
    return () => {
      const cleanupListeners = async () => {
        if (isCapacitor) {
          try {
            const { App } = await import('@capacitor/app');
            await App.removeAllListeners();
          } catch (err) {
            console.error('Error cleaning up listeners:', err);
          }
        }
      };
      cleanupListeners();
    };
  }, [location.pathname, navigate]);
};
