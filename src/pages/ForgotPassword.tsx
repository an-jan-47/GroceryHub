
import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Starting password reset process...');
      
      const { data, error } = await supabase.functions.invoke('send-reset-otp', {
        body: { email }
      });

      console.log('Reset password response:', { data, error });

      if (error) {
        console.error('Reset password error:', error);
        throw new Error(error.message || 'Failed to send reset OTP');
      }

      // Show the OTP for testing (remove in production)
      if (data?.otp) {
        toast(`Password reset OTP sent! Your OTP is: ${data.otp}`, {
          description: 'Use this OTP to reset your password.',
          duration: 15000,
        });
      } else {
        toast('Password reset OTP sent!', {
          description: 'Check your email for the OTP to reset your password.',
          duration: 5000,
        });
      }

      // Navigate to reset password page with email
      navigate('/reset-password', { 
        state: { email } 
      });
    } catch (error: any) {
      console.error('Reset password error:', error);
      toast('Error', {
        description: error.message || 'Failed to send reset OTP. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <Link to="/login" className="flex items-center text-blue-600 hover:text-blue-800">
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Login
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Forgot your password?
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email address and we'll send you an OTP to reset your password.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="email-address">Email address</Label>
            <Input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            {isLoading ? 'Sending OTP...' : 'Send Reset OTP'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
