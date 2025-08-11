
import React from "react";
import { useAuth } from '@/contexts/AuthContext';
import { RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const LoadingScreen = () => {
  const { loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!authLoading) {
      // Delay navigation slightly to ensure smooth transition
      const timer = setTimeout(() => {
        navigate('/', { replace: true });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [authLoading, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <h1 className="text-3xl font-bold text-blue-900 mb-8">GroceryHub</h1>
      
      <div className="flex flex-col items-center">
        <RefreshCw className="animate-spin w-8 h-8 text-gray-600 mb-4" />
        <p className="text-gray-500">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
