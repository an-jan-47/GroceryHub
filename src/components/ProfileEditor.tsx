import React, { useState, useEffect } from "react";

import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import { User, Mail, Phone, Shield, Lock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { sanitizeInput } from '@/services/securityService';

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
  const [saveSuccess, setSaveSuccess] = useState(false);

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

    if (!name.trim()) {
      toast("Name required", {
        description: "Please enter your name"
      });
      return;
    }

    try {
      setSaveSuccess(false);
      setIsSaving(true);

      const sanitizedName = sanitizeInput(name);
      const sanitizedPhone = sanitizeInput(phone);

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: sanitizedName,
          phone: sanitizedPhone,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      const { error: authError } = await supabase.auth.updateUser({
        data: { name: sanitizedName, phone: sanitizedPhone }
      });

      if (authError) throw authError;

      toast("Profile updated", {
        description: "Your profile has been successfully updated"
      });

      setSaveSuccess(true);
      setProfile(prev => prev ? { ...prev, name: sanitizedName, phone: sanitizedPhone } : null);

    } catch (error) {
      console.error('Error updating profile:', error);
      toast("Update failed", {
        description: "There was an error updating your profile"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full shadow-none border-0 sm:border sm:shadow-sm">
        <CardHeader className="px-4 py-3 sm:p-6">
          <Skeleton className="h-6 w-40 mb-1" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent className="space-y-4 px-4 sm:p-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
        <CardFooter className="px-4 py-3 sm:p-6">
          <Skeleton className="h-10 w-32" />
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-none border-0 sm:border sm:shadow-sm bg-white">
      <CardHeader className="px-4 py-3 sm:p-6 border-b">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-500" />
          <CardTitle className="text-lg sm:text-xl">Profile Information</CardTitle>
        </div>
        <CardDescription>Update your personal information</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 px-4 pt-4 pb-2 sm:p-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="h-4 w-4 opacity-70" />
              Full Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="bg-gray-50 focus:bg-white"
              autoComplete="name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4 opacity-70" />
              Phone Number
            </Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              type="tel"
              className="bg-gray-50 focus:bg-white"
              autoComplete="tel"
            />
          </div>

          {user?.email && (
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4 opacity-70" />
                Email
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  value={user.email}
                  disabled
                  readOnly
                  className="bg-gray-100 text-gray-500 pr-10"
                  autoComplete="email"
                />
                <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500">Email cannot be changed</p>
            </div>
          )}
        </CardContent>

        <CardFooter className="px-4 py-3 sm:p-6 flex flex-col sm:flex-row gap-2 sm:items-center justify-between border-t bg-gray-50">
          <div className="text-sm">
            {saveSuccess && (
              <p className="text-green-600 flex items-center gap-1">
                <Shield className="h-4 w-4" />
                Profile information updated successfully
              </p>
            )}
          </div>
          <Button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto bg-primaryBlue hover:bg-primaryBlue-dark text-white"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ProfileEditor;
