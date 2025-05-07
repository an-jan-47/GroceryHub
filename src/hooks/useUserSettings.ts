
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';

export interface UserSettings {
  marketing_emails: boolean;
  product_updates: boolean;
  order_notifications: boolean;
  personalized_recommendations: boolean;
  data_sharing: boolean;
  account_activity_alerts: boolean;
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  marketing_emails: false,
  product_updates: true,
  order_notifications: true,
  personalized_recommendations: true,
  data_sharing: false,
  account_activity_alerts: true
};

export const useUserSettings = () => {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_USER_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();

  const fetchSettings = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      // If user has settings, use them
      if (data) {
        setSettings({
          marketing_emails: data.marketing_emails || false,
          product_updates: data.product_updates ?? true,
          order_notifications: data.order_notifications ?? true,
          personalized_recommendations: data.personalized_recommendations ?? true,
          data_sharing: data.data_sharing || false,
          account_activity_alerts: data.account_activity_alerts ?? true
        });
      }
    } catch (error) {
      console.error('Error fetching privacy settings:', error);
      toast("Error loading settings", {
        description: "Failed to load your privacy settings"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings?: Partial<UserSettings>) => {
    if (!user) return;
    
    const updatedSettings = newSettings ? { ...settings, ...newSettings } : settings;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          ...updatedSettings,
          updated_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      setSettings(updatedSettings);
      
      toast("Settings saved", {
        description: "Your privacy settings have been updated"
      });
      
      return true;
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      toast("Error saving settings", {
        description: "Failed to save your privacy settings"
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (key: keyof UserSettings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  useEffect(() => {
    fetchSettings();
  }, [user]);

  return {
    settings,
    isLoading,
    isSaving,
    saveSettings,
    updateSetting,
    fetchSettings
  };
};
