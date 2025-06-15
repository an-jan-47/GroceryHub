
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Routes where swipe navigation should be disabled
const DISABLED_ROUTES = [
  '/',  // Added home page to prevent accidental navigation
  '/login',
  '/checkout',
  '/payment',
  '/address',
  '/order-confirmation'
];

export const useNavigationGestures = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Don't enable gestures for disabled routes
    if (DISABLED_ROUTES.some(route => location.pathname.startsWith(route))) {
      console.log('Navigation gestures disabled for route:', location.pathname);
      return;
    }

    let startX = 0;
    let startY = 0;
    let startTime = 0;
    let isScrolling = false;

    const MINIMUM_SWIPE_DISTANCE = 100; // Increased from 50px to 100px
    const MINIMUM_SWIPE_TIME = 200; // Minimum 200ms for a valid swipe
    const MAXIMUM_TAP_TIME = 150; // Maximum 150ms is considered a tap
    const MAXIMUM_VERTICAL_DEVIATION = 80; // Maximum vertical movement allowed for horizontal swipe

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startTime = Date.now();
      isScrolling = false;
      console.log('Touch start:', { startX, startY, startTime });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!startX || !startY) return;

      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;

      const diffX = Math.abs(startX - currentX);
      const diffY = Math.abs(startY - currentY);

      // If it's more vertical movement than horizontal, it's likely a scroll
      if (diffY > diffX) {
        return;
      }

      // Only prevent default if it's a significant horizontal movement
      if (diffX > MINIMUM_SWIPE_DISTANCE && diffY < MAXIMUM_VERTICAL_DEVIATION) {
        isScrolling = true;
        e.preventDefault();
        console.log('Preventing default scroll for swipe gesture');
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!startX || !startY) return;

      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const endTime = Date.now();
      
      const diffX = startX - endX;
      const diffY = Math.abs(startY - endY);
      const duration = endTime - startTime;

      console.log('Touch end:', { 
        diffX, 
        diffY, 
        duration, 
        isScrolling,
        minimumDistance: MINIMUM_SWIPE_DISTANCE,
        minimumTime: MINIMUM_SWIPE_TIME,
        maximumTapTime: MAXIMUM_TAP_TIME
      });

      // Reset values
      startX = 0;
      startY = 0;
      startTime = 0;
      isScrolling = false;

      // Don't navigate if it was a quick tap/click
      if (duration < MAXIMUM_TAP_TIME) {
        console.log('Ignoring quick tap/click');
        return;
      }

      // Don't navigate if the gesture was too short in duration
      if (duration < MINIMUM_SWIPE_TIME) {
        console.log('Swipe too quick, ignoring');
        return;
      }

      // Don't navigate if the swipe distance is too small
      if (Math.abs(diffX) < MINIMUM_SWIPE_DISTANCE) {
        console.log('Swipe distance too small, ignoring');
        return;
      }

      // Don't navigate if there's too much vertical movement (likely a scroll)
      if (diffY > MAXIMUM_VERTICAL_DEVIATION) {
        console.log('Too much vertical movement, likely a scroll');
        return;
      }

      // Swipe right (back)
      if (diffX < -MINIMUM_SWIPE_DISTANCE) {
        console.log('Navigating back');
        navigate(-1);
      }
      // Swipe left (forward)
      else if (diffX > MINIMUM_SWIPE_DISTANCE) {
        console.log('Navigating forward');
        navigate(1);
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [navigate, location.pathname]);
};
