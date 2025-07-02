
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';

export function useAuthCheck() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const checkAuthForCheckout = () => {
    if (!user) {
      toast('Please sign in to continue', {
        description: 'You need to be logged in to place an order'
      });
      navigate('/login');
      return false;
    }
    return true;
  };

  return {
    checkAuthForCheckout,
    isAuthenticated: !!user
  };
}
