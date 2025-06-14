
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';

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
  const { signUp, signInWithGoogle, user } = useAuth();
  
  useEffect(() => {
    // Redirect if user is already logged in
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (formError) setFormError(null);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.password) {
      setFormError("Please fill in all required fields");
      return;
    }
    
    // Enhanced password validation
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
      // Don't navigate - user needs to confirm their email first
    } catch (error: any) {
      console.error('Signup error:', error);
      
      // Handle specific Supabase email validation error
      if (error.message?.includes('invalid') && error.message?.includes('Email')) {
        setFormError(`Email validation error: Please use a valid email address. For development, try using a reliable email service like Gmail, Outlook, or Yahoo.`);
      } else {
        setFormError(error.message || "An unexpected error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleGoogleSignUp = async (e: React.MouseEvent) => {
    try {
      setFormError(null);
      await signInWithGoogle();
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      setFormError(error.message || "Failed to sign in with Google");
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Create Account</h1>
            <p className="mt-2 text-gray-600">Sign up to get started shopping</p>
          </div>
          
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {formError}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <Input
                id="name"
                name="name"
                placeholder="Your name"
                value={formData.name}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Your email address"
                value={formData.email}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
              <Input
                id="phone"
                name="phone"
                placeholder="Your mobile number"
                value={formData.phone}
                onChange={handleInputChange}
                className="input-field"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters with uppercase, lowercase, numbers, and special characters</p>
            </div>
            
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full  bg-primaryBlue hover:bg-primaryBlue-dark text-white"
            >
              {isSubmitting ? 'Creating account...' : 'Sign Up'}
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>
            
            <button 
              type="button"
              onClick={handleGoogleSignUp}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/>
              </svg>
              Continue with Google
            </button>
          </form>
          
          <div className="text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-brand-blue hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SignUp;
