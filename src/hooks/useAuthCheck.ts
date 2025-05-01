
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';

export const useAuthCheck = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const checkAuthForCheckout = () => {
    if (!user) {
      toast('Sign in required', {
        description: 'Please sign in to complete your purchase',
      });
      navigate('/login');
      return false;
    }
    return true;
  };

  return { checkAuthForCheckout, isAuthenticated: !!user };
};
