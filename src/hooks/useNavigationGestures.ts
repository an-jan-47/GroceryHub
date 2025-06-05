
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useNavigationGestures = () => {
  const navigate = useNavigate();

  useEffect(() => {
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

    // Add keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        navigate(-1);
      } else if (e.altKey && e.key === 'ArrowRight') {
        e.preventDefault();
        navigate(1);
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);
};
