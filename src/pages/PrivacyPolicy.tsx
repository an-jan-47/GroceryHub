import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';

const PrivacyPolicy = () => {
  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      <Header />
      
      <main className="container px-4 py-4 mx-auto max-w-2xl">
        <div className="py-3 flex items-center">
          <Link to="/help-support" className="flex items-center text-gray-500">
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span>Back to Help & Support</span>
          </Link>
        </div>
        
        <h1 className="text-2xl font-bold mb-6">Privacy Policy – GroceryHub</h1>
        
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 mb-4">Effective Date: [10-06-2025]</p>
          <p className="text-gray-600 mb-6">Last Updated: [10-06-2025]</p>
          
          <p className="mb-6">GroceryHub values your privacy and is committed to protecting your personal and business information. This Privacy Policy explains how we collect, use, share, and protect your data when you use our B2B wholesale grocery platform.</p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">1. Information We Collect</h2>
          <p>When you register or place orders on the GroceryHub app, we may collect the following information:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Business name</li>
            <li>Contact name</li>
            <li>Email address</li>
            <li>Phone number</li>
            <li>Delivery address/location</li>
            <li>Payment method (processed via third-party service)</li>
            <li>Login credentials (password is encrypted)</li>
          </ul>
          <p>We may also automatically collect technical information like device type, IP address, and app usage data using cookies or similar technologies.</p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">2. How We Use Your Information</h2>
          <p>We use your information for the following purposes:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>To process and deliver your orders</li>
            <li>To verify your business identity</li>
            <li>To contact you for order-related communications</li>
            <li>To send promotional or marketing updates (offers, deals, and product launches)</li>
            <li>To improve the app's functionality and user experience</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">3. Third-Party Sharing</h2>
          <p>We may share your data with:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Delivery/logistics partners to complete deliveries</li>
            <li>Payment service provider (Razorpay) for secure transaction processing</li>
            <li>Marketing partners for targeted communication (only where consent is applicable)</li>
          </ul>
          <p>We do not sell your personal data to anyone.</p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">4. Data Security</h2>
          <p>Your data is stored securely using encrypted servers hosted on trusted third-party platforms (e.g., cloud services). We implement reasonable safeguards to prevent unauthorized access or disclosure.</p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">5. User Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Access, correct, or update your personal or business information</li>
            <li>Delete your account and all associated data by using the logout and delete option within the app</li>
          </ul>
          <p>For any manual data removal requests, you may also contact us via:</p>
          <ul className="list-none mb-4">
            <li>Email: harshit345480@gmail.com</li>
            <li>Phone: +91-7352402688</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">6. Cookies and Tracking</h2>
          <p>We use cookies and similar technologies to:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Understand user behavior on the app/website</li>
            <li>Improve speed, performance, and content recommendations</li>
          </ul>
          <p>You may manage cookie settings in your browser/app preferences.</p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">7. Right to Reject Orders</h2>
          <p>GroceryHub reserves the right to cancel or reject any order at its sole discretion, including but not limited to:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Suspicious or fraudulent activity</li>
            <li>Pricing or inventory errors</li>
            <li>Business account verification issues</li>
            <li>Violations of our Terms of Use or this Privacy Policy</li>
          </ul>
          <p>In case of such cancellations, a full refund will be initiated (if applicable) via the original payment method.</p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">8. Changes to the Policy</h2>
          <p>We reserve the right to update this Privacy Policy from time to time. Any changes will be reflected in the "Last Updated" section and notified through the app.</p>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default PrivacyPolicy;