
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const MobileAppRedirect = () => {
  const location = useLocation();
  const [showRedirect, setShowRedirect] = useState(false);

  useEffect(() => {
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isProductPage = location.pathname.startsWith('/product/');
    
    if (isMobile && isProductPage) {
      // Show redirect options after a short delay
      const timer = setTimeout(() => {
        setShowRedirect(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [location]);

  const openInApp = () => {
    const deepLink = `groceryhub://${location.pathname}${location.search}`;
    window.location.href = deepLink;
    
    // Fallback after 2 seconds
    setTimeout(() => {
      window.location.href = 'https://play.google.com/store/apps/details?id=com.groceryhub.app';
    }, 2000);
  };

  const continueInBrowser = () => {
    setShowRedirect(false);
  };

  if (!showRedirect) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Open in GroceryHub App</h3>
          <p className="text-gray-600 mb-4">
            Get a better experience with our mobile app
          </p>
          
          <div className="space-y-3">
            <Button onClick={openInApp} className="w-full">
              Open in App
            </Button>
            <Button 
              variant="outline" 
              onClick={continueInBrowser}
              className="w-full"
            >
              Continue in Browser
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileAppRedirect;
