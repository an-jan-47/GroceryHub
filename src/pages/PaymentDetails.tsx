import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';

const PaymentDetails = () => {
  return (
    <div className="min-h-screen pb-20 bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <Link to="/profile" className="inline-flex items-center text-gray-600 mb-4">
          <ChevronLeft className="h-5 w-5" />
          <span>Back to Profile</span>
        </Link>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold mb-6">Payment Details</h1>
          
          <div className="space-y-4">
            <div className="border-b pb-4">
              <h2 className="text-lg font-semibold mb-4">Bank Account Information</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Account Holder Name</span>
                  <span className="font-medium">Amrita Traders</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Account Number</span>
                  <span className="font-medium">455930110000100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">IFSC Code</span>
                  <span className="font-medium">BKID0004559</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bank Name</span>
                  <span className="font-medium">Bank of India</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Branch</span>
                  <span className="font-medium">Hisua</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default PaymentDetails;