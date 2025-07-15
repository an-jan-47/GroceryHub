
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Home = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-8">Welcome to GroceryHub</h1>
          
          {user ? (
            <div className="space-y-4">
              <p className="text-lg">Welcome back, {user.email}!</p>
              <div className="space-x-4">
                <Button asChild>
                  <Link to="/dashboard">Go to Dashboard</Link>
                </Button>
                <Button variant="outline" onClick={signOut}>
                  Sign Out
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-lg">Please sign in to continue</p>
              <div className="space-x-4">
                <Button asChild>
                  <Link to="/signin">Sign In</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
