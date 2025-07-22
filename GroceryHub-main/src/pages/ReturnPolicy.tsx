import React from "react";
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';

const ReturnPolicy = () => {
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
        
        <h1 className="text-2xl font-bold mb-6">Return & Replace Policy – GroceryHub</h1>
        
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 mb-4">Effective Date: [10-06-2025]</p>
          
          <p className="mb-6">At GroceryHub, we aim to provide quality wholesale grocery service to retail businesses. However, if you receive a product that is damaged, expired, incorrect, or mispriced, our Return & Replace Policy ensures a smooth resolution.</p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">1. Eligibility for Return or Replacement</h2>
          <p>You may request a return or replacement for the following issues:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Damaged items</li>
            <li>Expired products</li>
            <li>Wrong product delivered</li>
            <li>Pricing errors</li>
            <li>Perishable items not fit for sale</li>
          </ul>
          
          <p>Only bulk or eligible orders qualify. We do not accept returns for:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Opened packages</li>
            <li>Fresh produce once delivered and accepted</li>
            <li>Products with minor price variation</li>
            <li>Single-product orders</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">2. Return Request Timeline</h2>
          <p>All return or replacement requests must be raised within 7 days of delivery.</p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">3. How to Request a Return or Replacement</h2>
          <p>You can initiate a return or replacement through any of the following channels:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Via the GroceryHub App</li>
            <li>Email: harshit345480@gmail.com</li>
            <li>Phone Call: +91-7352402688</li>
            <li>WhatsApp: +91-7352402688</li>
          </ul>
          <p>Please provide order ID, product name, and photos (if applicable) for quicker processing.</p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">4. Pickup and Refund Process</h2>
          <p>GroceryHub will arrange for product pickup directly from your business address.</p>
          <p>Once the returned item is verified, refunds will be processed to the original payment method within 5–7 business days.</p>
          <p>For COD orders, refunds will be issued via bank transfer or digital wallet, as per your preference.</p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">5. Conditions for Approval</h2>
          <p>To be eligible, the product must:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Be in its original packaging.</li>
            <li>Not be opened or used.</li>
            <li>Include original invoice or proof of purchase.</li>
          </ul>
          <p>GroceryHub reserves the right to approve or reject return requests based on product condition and policy guidelines.</p>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default ReturnPolicy;