
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const DeepLinkHandler = () => {
  const location = useLocation();

  useEffect(() => {
    // Check if we're on a mobile device
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile && location.pathname.startsWith('/product/')) {
      // Try to open the app first
      const appScheme = 'groceryhub://';
      const fallbackUrl = 'https://play.google.com/store/apps/details?id=com.groceryhub.app';
      
      // Create the deep link URL
      const deepLink = `${appScheme}${location.pathname}${location.search}`;
      
      // Try to open the app
      const startTime = Date.now();
      window.location.href = deepLink;
      
      // If app doesn't open within 2 seconds, redirect to Play Store
      setTimeout(() => {
        const currentTime = Date.now();
        if (currentTime - startTime < 2100) {
          // App didn't open, redirect to Play Store
          window.location.href = fallbackUrl;
        }
      }, 2000);
    }
  }, [location]);

  return null;
};

export default DeepLinkHandler;
