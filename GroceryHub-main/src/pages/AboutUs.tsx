import React from "react";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';

const AboutUs = () => {
  const navigate = useNavigate();
  
  return (
    <div className="pb-20 min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 flex items-center">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="p-0 h-auto"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </Button>
        </div>
        
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg overflow-hidden shadow-lg mb-8">
          <div className="p-8 md:p-12 text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">About Us – GroceryHub</h1>
            <p className="text-lg md:text-xl opacity-90">
              Welcome to GroceryHub, where convenience and quality meet.
            </p>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <p className="text-lg mb-6">
            We are a dedicated B2B wholesale platform designed exclusively for retail shop owners and bulk grocery buyers across India.
          </p>
          
          <p className="text-lg mb-8">
            At GroceryHub, our mission is simple: to make grocery procurement faster, more reliable, and cost-effective for businesses. Whether you're a local kirana store, supermarket, or distributor, we bring you a wide range of products—from everyday essentials to specialty items—sourced from trusted suppliers.
          </p>
          
          <h2 className="text-2xl font-bold mb-6">Why Choose GroceryHub?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">✅</span>
              <span>Verified Wholesale Rates</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🚚</span>
              <span>Timely Doorstep Delivery (1–7 Days)</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🔐</span>
              <span>Secure Payments (Online or COD)</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📲</span>
              <span>Easy-to-Use App for Business Orders</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🤝</span>
              <span>Built on Trust, Quality & Transparency</span>
            </div>
          </div>
          
          <p className="text-lg mb-8">
            We believe in empowering the retail community by providing them with the tools and convenience to compete in today's fast-paced market. With a growing network and personalized support, GroceryHub is your reliable partner in grocery retail success.
          </p>
          
          <h2 className="text-2xl font-bold mb-6">Have questions or need help?</h2>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-blue-600" />
              <span>Email: harshit345480@gmail.com</span>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-blue-600" />
              <span>Phone: +91-7352402688</span>
            </div>
          </div>
          
          <p className="text-lg mt-8 text-center text-gray-600">
            Let GroceryHub handle your supply, so you can focus on serving your customers better.
          </p>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default AboutUs;
