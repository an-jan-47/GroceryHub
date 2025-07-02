
import { useEffect } from 'react';

export const useNavigationGestures = () => {
  useEffect(() => {
    console.log('Navigation gestures hook initialized');
    
    // Add any navigation gesture logic here if needed
    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle keyboard navigation if needed
      if (event.key === 'Escape') {
        console.log('Escape key pressed');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
};
