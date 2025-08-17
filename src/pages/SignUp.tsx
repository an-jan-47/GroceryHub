import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft } from 'lucide-react';

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { signUp, signInWithGoogle, user, loading: authLoading } = useAuth();
  
  useEffect(() => {
    // Redirect authenticated users
    if (!authLoading && user) {
      console.log('User authenticated, redirecting to home');
      navigate('/');
    }
  }, [user, authLoading, navigate]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formError) setFormError(null);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password) {
      setFormError("Please fill in all required fields");
      return;
    }
    
    const validatePasswordStrength = (password: string): { isValid: boolean; feedback: string } => {
      const minLength = 8;
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumbers = /\d/.test(password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

      if (password.length < minLength) {
        return { isValid: false, feedback: "Password must be at least 8 characters long" };
      }
      if (!hasUpperCase) {
        return { isValid: false, feedback: "Password must contain at least one uppercase letter" };
      }
      if (!hasLowerCase) {
        return { isValid: false, feedback: "Password must contain at least one lowercase letter" };
      }
      if (!hasNumbers) {
        return { isValid: false, feedback: "Password must contain at least one number" };
      }
      if (!hasSpecialChar) {
        return { isValid: false, feedback: "Password must contain at least one special character" };
      }

      return { isValid: true, feedback: "" };
    };

    const { isValid, feedback } = validatePasswordStrength(formData.password);
    if (!isValid) {
      setFormError(feedback);
      return;
    }
    
    setIsSubmitting(true);
    setFormError(null);
    
    try {
      await signUp(
        formData.email,
        formData.password,
        { 
          name: formData.name,
          phone: formData.phone 
        }
      );
    } catch (error: any) {
      console.error('Signup error:', error);
      
      if (error.message?.includes('Account already exists')) {
        setFormError('This email is already registered. Please try signing in instead.');
      } else if (error.message?.includes('Email service error')) {
        setFormError('Email service is temporarily unavailable. Please try again later.');
      } else {
        setFormError('Account creation failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setFormError(null);
    
    try {
      console.log('Google sign-up button clicked');
      await signInWithGoogle();
      // For mobile apps, don't set loading to false as the flow continues externally
      // The auth state change will handle navigation
    } catch (error: any) {
      console.error('Google sign-up error:', error);
      setFormError("Google sign-up failed. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Show loading spinner while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col justify-start px-4 py-6 bg-gray-50 overflow-y-auto md:py-12 md:justify-center">
      <div className="w-full max-w-md mx-auto space-y-6 bg-white p-6 rounded-lg shadow-md md:p-8 md:space-y-8">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center text-blue-600 hover:text-blue-800 mb-2 md:mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-1" /> Back to Home
        </button>

        <div className="space-y-2 md:space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900">
            Create Account
          </h2>
          <p className="text-center text-sm text-gray-600">
            Already have an account? {' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </div>

        {formError && (
          <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md border border-red-200">
            {formError}
          </div>
        )}

        {/* Google Sign Up Button */}
        <Button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={isSubmitting}
          className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {isSubmitting ? 'Creating account...' : 'Continue with Google'}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or create account with email</span>
          </div>
        </div>

        <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-3 md:space-y-4">
            <div>
              <Label htmlFor="name" className="block mb-1.5">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your full name"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="email" className="block mb-1.5">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="phone" className="block mb-1.5">Phone (optional)</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your phone number"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="password" className="block mb-1.5">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Create a password"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={isSubmitting}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
