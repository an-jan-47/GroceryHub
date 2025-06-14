import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';

const TermsOfUse = () => {
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
        
        <h1 className="text-2xl font-bold mb-6">Terms of Use – GroceryHub</h1>
        
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 mb-4">Effective Date: [10-06-2025]</p>
          
          <p className="mb-6">Welcome to GroceryHub, a B2B wholesale grocery platform built to serve retail shop owners and bulk buyers. By accessing or using our mobile application or website, you agree to be bound by these Terms of Use. Please read them carefully.</p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">1. Eligibility</h2>
          <p>GroceryHub is strictly for business-to-business (B2B) use. By registering, you confirm that you are a retail business owner or authorized representative of a business entity. You must be at least 18 years old to use this platform.</p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">2. User Account</h2>
          <p>To use GroceryHub, you must create an account by providing your name, email address, phone number, and a secure password. You are responsible for all activities under your account. Please keep your credentials confidential.</p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">3. Ordering and Payment</h2>
          <p>We offer two payment options:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Online Payments via UPI, credit/debit cards, or digital wallets.</li>
            <li>Cash on Delivery (COD) at the time of receiving the goods.</li>
          </ul>
          <p>Minimum order values may apply as per seller-specific terms.</p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">4. Delivery Policy</h2>
          <p>Deliveries are managed by GroceryHub directly. Orders are usually delivered within 1 to 7 working days, depending on location and order size. You will be notified via SMS/email regarding delivery updates.</p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">5. Prohibited Activities</h2>
          <p>Users must not:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Use the platform for personal or non-business purposes.</li>
            <li>List or purchase restricted items like alcohol, tobacco, or any illegal product.</li>
            <li>Misrepresent business identity or provide false account information.</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">6. Intellectual Property</h2>
          <p>All content on the GroceryHub app/website—logos, images, design, and software—is the intellectual property of GroceryHub and may not be copied or reused without permission.</p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">7. Account Termination</h2>
          <p>We reserve the right to suspend or terminate your account if you violate these terms or engage in fraudulent activity.</p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">8. Limitation of Liability</h2>
          <p>GroceryHub is not liable for indirect or consequential damages resulting from use of the platform. Our liability is limited to the value of the disputed order.</p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">9. Customer Support and Dispute Resolution</h2>
          <p>For any issues, please contact our customer support team via:</p>
          <ul className="list-none mb-4">
            <li>Email: harshit345480@gmail.com</li>
            <li>Phone: +91-7352402688</li>
          </ul>
          <p>We aim to resolve all complaints fairly and promptly.</p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">10. Governing Law</h2>
          <p>These terms are governed by the laws of India. Any disputes arising shall be under the jurisdiction of courts in [Hisua, Gaya, Bihar].</p>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default TermsOfUse;