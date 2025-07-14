
import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      toast('Please fill in all required fields');
      return;
    }

    if (password.length < 6) {
      toast('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Starting signup process...');
      
      const { data, error } = await supabase.functions.invoke('send-signup-otp', {
        body: { email, password, name, phone }
      });

      console.log('Signup response:', { data, error });

      if (error) {
        console.error('Signup error:', error);
        throw new Error(error.message || 'Failed to send OTP');
      }

      // Show the OTP for testing (remove in production)
      if (data?.otp) {
        toast(`OTP sent! Your OTP is: ${data.otp}`, {
          description: 'Please verify your email with this OTP.',
          duration: 10000,
        });
      } else {
        toast('OTP sent!', {
          description: 'Please check your email for the OTP to verify your account.',
          duration: 5000,
        });
      }

      // Navigate to verification page
      navigate('/verify-signup', { 
        state: { email } 
      });
    } catch (error: any) {
      console.error('Signup error:', error);
      toast('Signup failed', {
        description: error.message || 'Failed to create account. Please try again.',
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
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join us today and start shopping
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              className="mt-1"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="email-address">Email address *</Label>
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

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              className="mt-1"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="password">Password *</Label>
            <div className="relative mt-1">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            disabled={isLoading}
          >
            {isLoading ? 'Sending OTP...' : 'Sign Up'}
          </Button>
        </form>

        <div className="text-center">
          <span className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
