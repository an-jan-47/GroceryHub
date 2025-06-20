import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { history } from '../history';

export const useNavigationGestures = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const isCapacitor = !!(window as any).Capacitor;

    const handleBack = async () => {
      if (location.pathname === '/') {
        // Only exit on home
        try {
          const { App } = await import('@capacitor/app');
          const shouldExit = window.confirm('Do you want to exit the app?');
          if (shouldExit) {
            await App.exitApp();
          }
        } catch (err) {
          console.error("Error exiting app:", err);
        }
      } else {
        // Use navigate(-1) with state preservation
        navigate(-1, { state: { preserveState: true } });
      }
    };

    const setupBackHandler = async () => {
      if (!isCapacitor) return;

      try {
        const { App } = await import('@capacitor/app');

        // Remove any existing listeners to prevent duplicates
        await App.removeAllListeners();

        // Set up back button handler
        App.addListener('backButton', async (data) => {
          console.log('Back button pressed', data);
          if (location.pathname === '/') {
            const shouldExit = window.confirm('Do you want to exit the app?');
            if (shouldExit) {
              await App.exitApp();
            }
          } else {
            // Use navigate(-1) with state preservation
            navigate(-1, { state: { preserveState: true } });
          }
        });

        // Initialize the GestureHelper if available
        if (isCapacitor) {
          try {
            // @ts-ignore - Custom plugin
            const { Plugins } = await import('@capacitor/core');
            if (Plugins.GestureHelper) {
              await Plugins.GestureHelper.enableEdgeToEdge();
              await Plugins.GestureHelper.disableZoom();
              
              // Add swipe gesture detection if available
              if (Plugins.GestureHelper.enableSwipeNavigation) {
                await Plugins.GestureHelper.enableSwipeNavigation();
              }
            }
          } catch (err) {
            console.error('Error initializing GestureHelper:', err);
          }
        }
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
