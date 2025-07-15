
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Profile } from '@/types/profile';

const ProfileEditor = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const sanitizeInput = (input: string) => {
    return input.trim().replace(/[<>]/g, '');
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user || !supabase) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('No profile found, will create on save');
          setName(user.user_metadata?.name || '');
          setPhone('');
        } else {
          throw error;
        }
      } else {
        setProfile(data);
        setName(data.name);
        setPhone(data.phone || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast('Error', {
        description: 'Failed to load profile data',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !supabase) return;

    setIsSaving(true);
    try {
      const sanitizedName = sanitizeInput(name);
      const sanitizedPhone = sanitizeInput(phone);

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: sanitizedName,
          phone: sanitizedPhone || null,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast('Profile updated successfully!');
      fetchProfile();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast('Error', {
        description: error.message || 'Failed to update profile',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>
          Update your personal information and contact details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isSaving}
              placeholder="Enter your full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isSaving}
              placeholder="Enter your phone number (optional)"
            />
          </div>

          <Button 
            type="submit" 
            disabled={isSaving || !name.trim()}
            className="w-full"
          >
            {isSaving ? 'Updating...' : 'Update Profile'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileEditor;
