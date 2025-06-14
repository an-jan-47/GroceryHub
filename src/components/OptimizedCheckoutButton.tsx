
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { toast } from '@/components/ui/sonner';

interface OptimizedCheckoutButtonProps {
  cartItems: any[];
  disabled?: boolean;
  className?: string;
}

const OptimizedCheckoutButton: React.FC<OptimizedCheckoutButtonProps> = ({ 
  cartItems, 
  disabled = false, 
  className = "" 
}) => {
  const navigate = useNavigate();
  const { checkAuthForCheckout } = useAuthCheck();

  const handleCheckout = () => {
    console.log('Checkout button clicked, cart items:', cartItems.length);
    
    if (cartItems.length === 0) {
      toast("Cart is empty", {
        description: "Add items to your cart before proceeding to checkout."
      });
      return;
    }

    // Check if user is authenticated before proceeding
    if (checkAuthForCheckout()) {
      console.log('User authenticated, navigating to address page');
      // Use navigate with replace to avoid adding to history stack
      navigate('/address', { replace: true });
    } else {
      console.log('User not authenticated');
    }
  };

  return (
    <Button 
      onClick={handleCheckout} 
      className={`w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium ${className}`}
      disabled={disabled || cartItems.length === 0}
    >
      Proceed to Checkout
    </Button>
  );
};

export default OptimizedCheckoutButton;
