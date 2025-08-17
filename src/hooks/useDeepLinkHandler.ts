
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export const useDeepLinkHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Add a small delay to ensure React context is properly initialized
    const timeoutId = setTimeout(() => {
      const handleDeepLink = async (url: string) => {
        console.log('Handling deep link:', url);
        
        try {
          const urlObj = new URL(url);
          const path = urlObj.pathname;
          const searchParams = urlObj.searchParams;
          
          // Handle auth callbacks
          if (path.includes('/auth') || searchParams.get('access_token')) {
            console.log('Handling auth callback');
            
            // Let Supabase handle the auth callback
            const { data, error } = await supabase.auth.getSession();
            
            if (error) {
              console.error('Auth callback error:', error);
              toast('Authentication failed', {
                description: 'Unable to complete sign in. Please try again.'
              });
              navigate('/login');
              return;
            }
            
            if (data.session) {
              console.log('Auth successful, user:', data.session.user.email);
              toast('Welcome back!', {
                description: `Signed in as ${data.session.user.email}`
              });
              navigate('/');
              return;
            }
          }
          
          // Handle product deep links
          if (path.includes('/product/')) {
            const productId = path.split('/product/')[1];
            console.log('Navigating to product:', productId);
            navigate(`/product/${productId}`);
            return;
          }
          
          // Handle other routes
          if (path && path !== '/') {
            console.log('Navigating to path:', path);
            navigate(path);
            return;
          }
          
          // Default to home
          navigate('/');
          
        } catch (error) {
          console.error('Error handling deep link:', error);
          navigate('/');
        }
      };

      const setupDeepLinkHandling = async () => {
        const isCapacitor = !!(window as any).Capacitor;
        
        if (isCapacitor) {
          try {
            const { App } = await import('@capacitor/app');
            
            // Handle app URL events (when app is already running)
            App.addListener('appUrlOpen', (event) => {
              console.log('App URL opened:', event.url);
              handleDeepLink(event.url);
            });
            
            // Check if app was opened with a URL (when app starts)
            const appUrl = await App.getLaunchUrl();
            if (appUrl?.url) {
              console.log('App launched with URL:', appUrl.url);
              // Small delay to ensure app is ready
              setTimeout(() => {
                handleDeepLink(appUrl.url);
              }, 500);
            }
            
          } catch (error) {
            console.error('Error setting up deep link handling:', error);
          }
        } else {
          // Web environment - check for auth hash
          const hash = window.location.hash;
          const search = window.location.search;
          
          if (hash.includes('access_token') || search.includes('access_token')) {
            console.log('Web auth callback detected');
            handleDeepLink(window.location.href);
          }
        }
      };

      setupDeepLinkHandling();
    }, 100); // Small delay to ensure context is ready

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      
      const cleanupListeners = async () => {
        const isCapacitor = !!(window as any).Capacitor;
        if (isCapacitor) {
          try {
            const { App } = await import('@capacitor/app');
            await App.removeAllListeners();
          } catch (error) {
            console.error('Error cleaning up deep link listeners:', error);
          }
        }
      };
      cleanupListeners();
    };
  }, [navigate]);
};
