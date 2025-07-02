import React, { useState, useEffect } from "react";

import { Link, useNavigate } from 'react-router-dom';
import { User, Package, LogOut, Heart, Settings, Lock, ShieldCheck, Info, Edit, ShoppingBag, MapPin, Tag, Shield, HelpCircle, CreditCard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import ProfileEditor from '@/components/ProfileEditor';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (user) {
      // Get user data
      setUserName(user.user_metadata?.name || 'User');
      setUserEmail(user.email || '');
      setIsLoading(false);
    }
  }, [user]);
  
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pb-20 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-blue-500 border-b-blue-500 border-gray-200 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pb-20 bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <div className="flex items-center">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-4 overflow-hidden">
              <User className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{userName}</h1>
              <p className="text-gray-500">{userEmail}</p>
            </div>
          </div>
        </div>
        
        {/* Orders & Wishlist */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <h2 className="text-lg font-bold mb-4">My Orders & Wishlist</h2>
          
          <div className="grid grid-cols-1 gap-2">
            <Link to="/order-history" className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-md">
              <div className="flex items-center">
                <Package className="h-5 w-5 text-blue-600 mr-3" />
                <span>My Orders</span>
              </div>
              <span className="text-gray-400">→</span>
            </Link>
            
            <Separator />
            
            <Link to="/wishlist" className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-md">
              <div className="flex items-center">
                <Heart className="h-5 w-5 text-red-500 mr-3" />
                <span>My Wishlist</span>
              </div>
              <span className="text-gray-400">→</span>
            </Link>
          </div>
        </div>
        
        {/* Account Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <h2 className="text-lg font-bold mb-4">Account Settings</h2>
          
          <div className="grid grid-cols-1 gap-2">
            <Link to="/payment-details" className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-md">
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 text-green-600 mr-3" />
                <span>Payment Details</span>
              </div>
              <span className="text-gray-400">→</span>
            </Link>
            
            <Separator />
            
            <Dialog>
              <DialogTrigger asChild>
                <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-md cursor-pointer">
                  <div className="flex items-center">
                    <Edit className="h-5 w-5 text-green-600 mr-3" />
                    <span>Edit Profile</span>
                  </div>
                  <span className="text-gray-400">→</span>
                </div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md mx-auto my-4 rounded-xl">
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                  <DialogDescription>
                    Update your personal information
                  </DialogDescription>
                </DialogHeader>
                <ProfileEditor />
              </DialogContent>
            </Dialog>
            
            <Separator />
            
            <Link to="/change-password" className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-md">
              <div className="flex items-center">
                <Lock className="h-5 w-5 text-amber-600 mr-3" />
                <span>Change Password</span>
              </div>
              <span className="text-gray-400">→</span>
            </Link>
            
            <Separator />
            
            <Link to="/privacy-settings" className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-md">
              <div className="flex items-center">
                <ShieldCheck className="h-5 w-5 text-indigo-600 mr-3" />
                <span>Privacy Settings</span>
              </div>
              <span className="text-gray-400">→</span>
            </Link>
          </div>
        </div>
        
        {/* About & Support */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <h2 className="text-lg font-bold mb-4">About & Support</h2>
          
          <div className="grid grid-cols-1 gap-2">
            <Link to="/about-us" className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-md">
              <div className="flex items-center">
                <Info className="h-5 w-5 text-blue-600 mr-3" />
                <span>About Us</span>
              </div>
              <span className="text-gray-400">→</span>
            </Link>
            
            <Separator />
            
            <Link to="/help-support" className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-md">
              <div className="flex items-center">
                <HelpCircle className="h-5 w-5 text-green-600 mr-3" />
                <span>Help & Support</span>
              </div>
              <span className="text-gray-400">→</span>
            </Link>
          </div>
        </div>
        
        {/* Logout Button */}
        <Button 
          variant="outline" 
          onClick={handleSignOut}
          className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="h-5 w-5 mr-2" />
          Sign Out
        </Button>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default Profile;
