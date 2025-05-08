
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Save } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';
import { useUserSettings } from '@/hooks/useUserSettings';

const PrivacySettings = () => {
  const { user } = useAuth();
  const {
    settings,
    isLoading,
    isSaving,
    saveSettings,
    updateSetting
  } = useUserSettings();
  
  const [isSaveComplete, setIsSaveComplete] = useState(false);
  
  const handleSave = async () => {
    const success = await saveSettings();
    if (success) {
      setIsSaveComplete(true);
      
      // Reset the save complete status after a while
      setTimeout(() => {
        setIsSaveComplete(false);
      }, 3000);
    }
  };
  
  if (!user) {
    return (
      <div className="pb-20">
        <Header />
        
        <main className="container px-4 py-4 mx-auto">
          <div className="text-center py-8">
            <h1 className="text-2xl font-bold">Please Sign In</h1>
            <p className="mt-2 text-gray-500">
              You need to be signed in to view and manage your privacy settings.
            </p>
            <Button asChild className="mt-4">
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </main>
        
        <BottomNavigation />
      </div>
    );
  }
  
  return (
    <div className="pb-20">
      <Header />
      
      <main className="container px-4 py-4 mx-auto">
        <div className="py-3 flex items-center">
          <Link to="/profile" className="flex items-center text-gray-500">
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span>Back to Profile</span>
          </Link>
        </div>
        
        <h1 className="text-2xl font-bold mb-4">Privacy Settings</h1>
        
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-48 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-72 mb-4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">Marketing Emails</h3>
                  <p className="text-sm text-gray-500">
                    Receive emails about special offers and promotions
                  </p>
                </div>
                <Switch
                  checked={settings.marketing_emails}
                  onCheckedChange={(value) => updateSetting('marketing_emails', value)}
                />
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">Product Updates</h3>
                  <p className="text-sm text-gray-500">
                    Notifications about new products and features
                  </p>
                </div>
                <Switch
                  checked={settings.product_updates}
                  onCheckedChange={(value) => updateSetting('product_updates', value)}
                />
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">Order Notifications</h3>
                  <p className="text-sm text-gray-500">
                    Updates about your orders, deliveries, and returns
                  </p>
                </div>
                <Switch
                  checked={settings.order_notifications}
                  onCheckedChange={(value) => updateSetting('order_notifications', value)}
                />
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">Personalized Recommendations</h3>
                  <p className="text-sm text-gray-500">
                    Allow us to use your browsing history to suggest products
                  </p>
                </div>
                <Switch
                  checked={settings.personalized_recommendations}
                  onCheckedChange={(value) => updateSetting('personalized_recommendations', value)}
                />
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">Data Sharing</h3>
                  <p className="text-sm text-gray-500">
                    Share your data with our trusted partners for improved services
                  </p>
                </div>
                <Switch
                  checked={settings.data_sharing}
                  onCheckedChange={(value) => updateSetting('data_sharing', value)}
                />
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">Account Activity Alerts</h3>
                  <p className="text-sm text-gray-500">
                    Get notified of login attempts and account changes
                  </p>
                </div>
                <Switch
                  checked={settings.account_activity_alerts}
                  onCheckedChange={(value) => updateSetting('account_activity_alerts', value)}
                />
              </div>
            </div>
            
            <div className="mt-8">
              <Button
                onClick={handleSave}
                disabled={isSaving || isSaveComplete}
                className="w-full"
              >
                {isSaving ? (
                  'Saving...'
                ) : isSaveComplete ? (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Saved!
                  </>
                ) : (
                  'Save Settings'
                )}
              </Button>
            </div>
          </div>
        )}
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default PrivacySettings;
