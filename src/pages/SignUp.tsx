
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

        <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
          {formError && (
            <div className="text-red-600 text-sm text-center">{formError}</div>
          )}

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
          </div>

          <Button
            type="submit"
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
