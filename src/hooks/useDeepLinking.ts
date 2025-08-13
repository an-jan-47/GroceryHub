
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useDeepLinking = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAppUrl = (url: string) => {
      // Extract path from deep link
      if (url.startsWith('groceryhub://')) {
        const path = url.replace('groceryhub://', '/');
        navigate(path);
      } else if (url.includes('modern-cart-nexus-app.vercel.app')) {
        // Handle web URLs
        const urlObj = new URL(url);
        navigate(urlObj.pathname + urlObj.search);
      }
    };

    // Check if running in Capacitor
    const isCapacitor = !!(window as any).Capacitor;
    
    if (isCapacitor) {
      // Handle app launch URL
      const setupAppUrlListener = async () => {
        try {
          const { App } = await import('@capacitor/app');
          
          // Listen for app URL open events
          App.addListener('appUrlOpen', (data) => {
            handleAppUrl(data.url);
          });

          // Handle initial URL if app was opened via deep link
          const urlData = await App.getLaunchUrl();
          if (urlData?.url) {
            handleAppUrl(urlData.url);
          }
        } catch (error) {
          console.error('Error setting up deep linking:', error);
        }
      };

      setupAppUrlListener();
    }
  }, [navigate]);
};
