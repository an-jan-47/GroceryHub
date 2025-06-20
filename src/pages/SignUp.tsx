
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';
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
  const { signUp, user } = useAuth();
  
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
        setFormError(`Please use a valid email address.`);
      } else {
        setFormError(error.message || "An unexpected error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Remove handleGoogleSignUp function
  
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50 overflow-y-auto">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Create Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign up for Exciting offers ahead
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Your name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Your email address"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone">Mobile Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Your mobile number"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create a password"
                  className="mt-1"
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
              <p className="mt-1 text-sm text-gray-500">
                Password must be at least 8 characters with uppercase, lowercase, numbers, and special characters
              </p>
            </div>
          </div>
          
          {formError && (
            <div className="text-red-500 text-sm">{formError}</div>
          )}
          
          <Button
            type="submit"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isSubmitting}
          >
            Sign Up
          </Button>
          
          {/* Remove the "Or continue with" section and Google button */}
          
          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
