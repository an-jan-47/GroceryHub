import React, { useState } from "react";

import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from '@/components/ui/sonner';

const DeleteAccount = () => {
  const { user, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [confirmText, setConfirmText] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (confirmText !== "DELETE") {
      toast("Confirmation text doesn't match", {
        description: "Please type DELETE to confirm account deletion"
      });
      return;
    }

    try {
      setIsDeleting(true);
      await deleteAccount();
      navigate('/login');
    } catch (error) {
      console.error('Error deleting account:', error);
      setIsDeleting(false);
    }
  };

  if (!user) {
    return (
      <div className="pb-20">
        <Header />
        <main className="container px-4 py-4 mx-auto">
          <div className="text-center py-8">
            <h1 className="text-2xl font-bold">Please Sign In</h1>
            <p className="mt-2 text-gray-500">
              You need to be signed in to delete your account.
            </p>
            <Button asChild className="mt-4 bg-blue-500 hover:bg-blue-600 text-white">
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </main>
        <BottomNavigation />
      </div>
    );
  }

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
        
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <div className="flex items-center justify-center mb-6">
            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <AlertTriangle className="h-8 w-8" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-center mb-6">Delete Account</h1>
          
          <div className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <h2 className="text-lg font-semibold text-red-700 mb-2">Warning: This action cannot be undone</h2>
              <p className="text-red-600">
                Deleting your account will permanently remove all your data, including:
              </p>
              <ul className="list-disc pl-5 mt-2 text-red-600">
                <li>Personal information</li>
                <li>Order history</li>
                <li>Saved addresses</li>
                <li>Payment information</li>
                <li>Wishlist items</li>
              </ul>
            </div>
            
            <div>
              <p className="text-gray-700 mb-4">
                To confirm deletion, please type <strong>DELETE</strong> in the field below:
              </p>
              <Input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="mb-4"
              />
              
              <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    disabled={confirmText !== "DELETE" || isDeleting}
                  >
                    {isDeleting ? "Deleting Account..." : "Delete My Account"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. Your account and all associated data will be permanently deleted.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700">
                      Yes, Delete My Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default DeleteAccount;