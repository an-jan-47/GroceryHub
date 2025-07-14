
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';

const VerifySignup = () => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/signup');
    }
  }, [email, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !email) {
      toast('Please enter the OTP');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-signup-otp', {
        body: { email, otp }
      });

      if (error) {
        console.error('Verification error:', error);
        throw new Error(error.message || 'Failed to verify OTP');
      }

      toast('Account verified successfully!', {
        description: 'You can now log in to your account.',
      });

      navigate('/login');
    } catch (error: any) {
      console.error('Verification error:', error);
      toast('Verification failed', {
        description: error.message || 'Invalid or expired OTP. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <Link to="/signup" className="flex items-center text-blue-600 hover:text-blue-800">
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Sign Up
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verify your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter the 6-digit OTP sent to {email}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="otp">Enter OTP</Label>
            <Input
              id="otp"
              name="otp"
              type="text"
              maxLength={6}
              autoComplete="one-time-code"
              required
              className="mt-1 text-center text-2xl tracking-widest"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isLoading || otp.length !== 6}
          >
            {isLoading ? 'Verifying...' : 'Verify Account'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default VerifySignup;
