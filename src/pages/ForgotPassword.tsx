
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const [attemptCount, setAttemptCount] = useState(0);
  const [lastAttemptTime, setLastAttemptTime] = useState(0);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast('Email is required', {
        description: 'Please enter your email address',
      });
      return;
    }
    
    // Simple rate limiting
    const now = Date.now();
    if (attemptCount >= 3 && (now - lastAttemptTime) < 60000) {
      toast('Too many attempts', {
        description: 'Please wait a minute before trying again',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });

      if (error) throw error;

      setIsSuccess(true);
      toast('Reset link sent', {
        description: 'Check your email for password reset instructions',
      });
      
      // Update rate limiting state
      setAttemptCount(prev => prev + 1);
      setLastAttemptTime(now);
    } catch (error: any) {
      console.error('Reset password error:', error);
      toast('Error', {
        description: error.message || 'Failed to send reset instructions',
      });
      
      // Still count failed attempts
      setAttemptCount(prev => prev + 1);
      setLastAttemptTime(now);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          <div className="mb-6">
            <Button
              variant="ghost"
              className="p-0 h-auto mb-4"
              onClick={() => navigate('/login')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to login
            </Button>
            
            <h1 className="text-3xl font-bold text-center">Reset Password</h1>
            <p className="mt-2 text-gray-600 text-center">
              Enter your email address and we'll send you instructions to reset your password.
            </p>
          </div>

          {isSuccess ? (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 text-center">
              <h3 className="font-medium text-green-800 mb-2">Check your inbox</h3>
              <p className="text-green-700">
                We've sent a password reset link to <span className="font-medium">{email}</span>
              </p>
              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => navigate('/login')}
                  className="mt-2"
                >
                  Return to login
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="w-full"
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full  bg-primaryBlue hover:bg-primaryBlue-dark text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Reset Instructions'}
              </Button>
            </form>
          )}
          
          <div className="text-center">
            <p className="text-gray-600">
              Remember your password?{" "}
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

export default ForgotPassword;
