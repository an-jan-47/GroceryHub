
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Globe, Mail, ShieldAlert, Info, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/sonner';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface PrivacySettings {
  marketing_emails: boolean;
  product_updates: boolean;
  order_notifications: boolean;
  personalized_recommendations: boolean;
  data_sharing: boolean;
  account_activity_alerts: boolean;
}

const PrivacySettings = () => {
  const [settings, setSettings] = useState<PrivacySettings>({
    marketing_emails: false,
    product_updates: true,
    order_notifications: true,
    personalized_recommendations: true,
    data_sharing: false,
    account_activity_alerts: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch user's privacy settings
  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
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
    
    fetchSettings();
  }, [user]);

  const handleToggle = (setting: keyof PrivacySettings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const saveSettings = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          ...settings,
          updated_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      toast("Settings saved", {
        description: "Your privacy settings have been updated"
      });
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      toast("Error saving settings", {
        description: "Failed to save your privacy settings"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="pb-20 min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 flex items-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/profile')}
            className="p-0 h-auto"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to profile
          </Button>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold">Privacy Settings</h1>
            <Button 
              onClick={saveSettings} 
              disabled={isLoading || isSaving}
              className="flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
          
          {isLoading ? (
            <div className="py-10 text-center">
              <div className="w-10 h-10 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading your settings...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="border-b pb-6">
                <h2 className="text-lg font-medium mb-4 flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-blue-500" />
                  Email Notifications
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Marketing Emails</p>
                      <p className="text-sm text-gray-500">Receive emails about promotions and special offers</p>
                    </div>
                    <Switch 
                      checked={settings.marketing_emails} 
                      onCheckedChange={() => handleToggle('marketing_emails')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Product Updates</p>
                      <p className="text-sm text-gray-500">Receive emails about product updates and new features</p>
                    </div>
                    <Switch 
                      checked={settings.product_updates} 
                      onCheckedChange={() => handleToggle('product_updates')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Order Notifications</p>
                      <p className="text-sm text-gray-500">Receive emails about your orders, deliveries, and returns</p>
                    </div>
                    <Switch 
                      checked={settings.order_notifications} 
                      onCheckedChange={() => handleToggle('order_notifications')}
                    />
                  </div>
                </div>
              </div>
              
              <div className="border-b pb-6">
                <h2 className="text-lg font-medium mb-4 flex items-center">
                  <ShieldAlert className="h-5 w-5 mr-2 text-blue-500" />
                  Data & Privacy
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Personalized Recommendations</p>
                      <p className="text-sm text-gray-500">Allow us to use your browsing history to recommend products</p>
                    </div>
                    <Switch 
                      checked={settings.personalized_recommendations} 
                      onCheckedChange={() => handleToggle('personalized_recommendations')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Data Sharing with Partners</p>
                      <p className="text-sm text-gray-500">Allow us to share your data with trusted third parties</p>
                    </div>
                    <Switch 
                      checked={settings.data_sharing} 
                      onCheckedChange={() => handleToggle('data_sharing')}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-medium mb-4 flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-blue-500" />
                  Account Security
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Account Activity Alerts</p>
                      <p className="text-sm text-gray-500">Receive alerts about suspicious activity on your account</p>
                    </div>
                    <Switch 
                      checked={settings.account_activity_alerts} 
                      onCheckedChange={() => handleToggle('account_activity_alerts')}
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-4 border-t">
                <div className="flex items-start bg-blue-50 p-4 rounded-md">
                  <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-sm text-blue-700">
                    Your privacy is important to us. We only collect data that helps us provide you with a better shopping experience. You can request a copy of your data or deletion of your account from the Privacy Center.
                  </p>
                </div>
                
                <div className="mt-4 flex justify-center">
                  <Button
                    variant="link"
                    onClick={() => navigate('/about-us')}
                    className="text-sm"
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    View our Privacy Policy
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default PrivacySettings;
