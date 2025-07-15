
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Profile } from '@/types/profile';

const ProfileEditor = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      setIsLoadingProfile(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        toast('Error loading profile');
        return;
      }

      if (data) {
        setProfile({
          id: data.id,
          name: data.name,
          phone: data.phone || undefined,
          created_at: data.created_at,
          updated_at: data.updated_at
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast('Error loading profile');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    setIsLoading(true);
    try {
      const sanitizedProfile = {
        name: profile.name.trim(),
        phone: profile.phone?.trim() || null
      };

      const { error } = await supabase
        .from('profiles')
        .update(sanitizedProfile)
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        toast('Error updating profile');
        return;
      }

      toast('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast('Error updating profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingProfile) {
    return <div className="text-center py-4">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="text-center py-4">No profile found</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          type="text"
          value={profile.name}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <Label htmlFor="phone">Phone (Optional)</Label>
        <Input
          id="phone"
          type="tel"
          value={profile.phone || ''}
          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
          disabled={isLoading}
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Updating...' : 'Update Profile'}
      </Button>
    </form>
  );
};

export default ProfileEditor;
