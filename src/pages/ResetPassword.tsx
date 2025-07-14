
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';

const ResetPassword = () => {
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !newPassword || !email) {
      toast('Please fill in all fields');
      return;
    }

    if (newPassword.length < 6) {
      toast('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-reset-otp', {
        body: { email, otp, newPassword }
      });

      if (error) {
        console.error('Reset password error:', error);
        throw new Error(error.message || 'Failed to reset password');
      }

      toast('Password reset successfully!', {
        description: 'You can now log in with your new password.',
      });

      navigate('/login');
    } catch (error: any) {
      console.error('Reset password error:', error);
      toast('Password reset failed', {
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
          <Link to="/forgot-password" className="flex items-center text-blue-600 hover:text-blue-800">
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter the OTP sent to {email} and your new password
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
              className="mt-1 text-center text-lg tracking-widest"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative mt-1">
              <Input
                id="newPassword"
                name="newPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                placeholder="Enter your new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isLoading || otp.length !== 6 || newPassword.length < 6}
          >
            {isLoading ? 'Resetting Password...' : 'Reset Password'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
