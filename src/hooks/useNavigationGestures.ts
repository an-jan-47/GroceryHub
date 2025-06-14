
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Routes where swipe navigation should be disabled
const DISABLED_ROUTES = [
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
      return;
    }

    let startX = 0;
    let startY = 0;
    let isScrolling = false;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isScrolling = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!startX || !startY) return;

      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;

      const diffX = startX - currentX;
      const diffY = startY - currentY;

      // Check if it's more horizontal than vertical movement
      if (Math.abs(diffX) > Math.abs(diffY)) {
        // Check if movement is significant enough (more than 50px)
        if (Math.abs(diffX) > 50) {
          isScrolling = true;
          e.preventDefault(); // Prevent default scrolling when swiping
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!startX || !startY || !isScrolling) return;

      const endX = e.changedTouches[0].clientX;
      const diffX = startX - endX;

      // Swipe right (back)
      if (diffX < -100) {
        navigate(-1);
      }
      // Swipe left (forward)
      else if (diffX > 100) {
        navigate(1);
      }

      startX = 0;
      startY = 0;
      isScrolling = false;
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
