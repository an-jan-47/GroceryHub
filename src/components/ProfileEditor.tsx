
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';

interface Profile {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

const ProfileEditor = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) {
          // If profile doesn't exist yet, create one
          if (error.code === 'PGRST116') {
            const newProfile = {
              id: user.id,
              name: user.user_metadata?.name || '',
              phone: user.user_metadata?.phone || '',
              email: user.email
            };
            
            await supabase.from('profiles').insert(newProfile);
            setProfile(newProfile);
            setName(newProfile.name);
            setPhone(newProfile.phone || '');
          } else {
            throw error;
          }
        } else {
          setProfile(data);
          setName(data?.name || '');
          setPhone(data?.phone || '');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast("Error loading profile", {
          description: "Please try again later",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [user]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      setIsSaving(true);
      
      // Update both profiles table and auth user metadata
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          name,
          phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (profileError) throw profileError;
      
      // Update auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { name, phone }
      });
      
      if (authError) throw authError;
      
      toast("Profile updated", {
        description: "Your profile has been successfully updated",
        position: "bottom-center"
      });
      
    } catch (error) {
      console.error('Error updating profile:', error);
      toast("Update failed", {
        description: "There was an error updating your profile",
        position: "bottom-center"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return <div className="flex justify-center p-4">
      <div className="w-8 h-8 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
    </div>;
  }
  
  return (
    <Card className="w-full shadow-none border-0 sm:border sm:shadow-sm">
      <CardHeader className="px-4 py-3 sm:p-6">
        <CardTitle className="text-lg sm:text-xl">Edit Profile</CardTitle>
        <CardDescription>Update your personal information</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 px-4 sm:p-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input 
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="bg-gray-50 focus:bg-white"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input 
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              type="tel"
              className="bg-gray-50 focus:bg-white"
            />
          </div>
          
          {user?.email && (
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email"
                value={user.email}
                disabled
                readOnly
                className="bg-gray-100 text-gray-500"
              />
              <p className="text-xs text-gray-500">Email cannot be changed</p>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="px-4 py-3 sm:p-6">
          <Button 
            type="submit" 
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ProfileEditor;
