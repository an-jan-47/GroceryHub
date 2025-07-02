import React from 'react';
import { useParams } from 'react-router-dom';

export default function OrderHistory() {
  const { userId } = useParams<{ userId: string }>();
  
  // Ensure userId is defined before using it
  const validUserId = userId || '';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Order History</h1>
        
        {validUserId ? (
          <div>
            <p>Showing orders for user: {validUserId}</p>
            {/* Order history content */}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-600">Please log in to view your order history.</p>
          </div>
        )}
      </div>
    </div>
  );
}
