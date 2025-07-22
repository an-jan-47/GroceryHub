import React, { useEffect } from "react";

import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface OrderCompletedGuardProps {
  children: React.ReactNode;
}

const OrderCompletedGuard: React.FC<OrderCompletedGuardProps> = ({ children }) => {
  const navigate = useNavigate();
  const [orderCompleted] = useLocalStorage<boolean>('orderCompleted', false);
  
  useEffect(() => {
    // If order has been completed, redirect to cart
    if (orderCompleted) {
      navigate('/cart', { replace: true });
    }
  }, [orderCompleted, navigate]);
  
  // If order is not completed, render children
  return <>{children}</>;
};

export default OrderCompletedGuard;
