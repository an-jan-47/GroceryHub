import { useState, useEffect } from 'react';

const LoadingScreen = () => {
  const [dots, setDots] = useState('');
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 500);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-blue-500 mb-4">GroceryHub</h1>
        <div className="flex items-center justify-center h-6">
          <span className="text-xl text-gray-600">Loading{dots}</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;