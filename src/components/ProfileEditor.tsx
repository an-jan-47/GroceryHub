
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Profile } from '@/types/profile';

const ProfileEditor = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id || '')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      const profileData: Profile = data || { 
        id: user?.id || '', 
        name: '', 
        phone: null 
      };
      setProfile(profileData);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast('Error loading profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile || !user) return;

    setSaving(true);
    try {
      const sanitizedProfile = {
        id: user.id,
        name: profile.name.trim(),
        phone: profile.phone?.trim() || null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(sanitizedProfile);

      if (error) throw error;

      toast('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast('Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading profile...</div>;
  }

  return (
    <div className="space-y-4 p-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={profile?.name || ''}
          onChange={(e) => setProfile(prev => prev ? { ...prev, name: e.target.value } : null)}
          placeholder="Enter your name"
        />
      </div>

      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          value={profile?.phone || ''}
          onChange={(e) => setProfile(prev => prev ? { ...prev, phone: e.target.value } : null)}
          placeholder="Enter your phone number"
        />
      </div>

      <Button 
        onClick={handleSave} 
        disabled={saving}
        className="w-full"
      >
        {saving ? 'Saving...' : 'Save Profile'}
      </Button>
    </div>
  );
};

export default ProfileEditor;
