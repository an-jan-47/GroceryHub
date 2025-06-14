import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Save } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { useAuth } from '@/contexts/AuthContext';
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
      setTimeout(() => {
        setIsSaveComplete(false);
      }, 3000);
    }
  };

  // Type the keys explicitly
  const privacyKeys = [
    'marketing_emails',
    'product_updates',
    'order_notifications',
    'personalized_recommendations',
    'data_sharing',
    'account_activity_alerts',
  ] as (keyof typeof settings)[];

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
            <Button asChild className="mt-4 bg-blue-500 hover:bg-blue-600 text-white">
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
              {privacyKeys.map((settingKey) => {
                const setting = {
                  marketing_emails: {
                    title: 'Marketing Emails',
                    description: 'Receive emails about special offers and promotions'
                  },
                  product_updates: {
                    title: 'Product Updates',
                    description: 'Notifications about new products and features'
                  },
                  order_notifications: {
                    title: 'Order Notifications',
                    description: 'Updates about your orders, deliveries, and returns'
                  },
                  personalized_recommendations: {
                    title: 'Personalized Recommendations',
                    description: 'Allow us to use your browsing history to suggest products'
                  },
                  data_sharing: {
                    title: 'Data Sharing',
                    description: 'Share your data with our trusted partners for improved services'
                  },
                  account_activity_alerts: {
                    title: 'Account Activity Alerts',
                    description: 'Get notified of login attempts and account changes'
                  }
                }[settingKey as keyof typeof settings];
                return (
                  <div key={settingKey}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{setting.title}</h3>
                        <p className="text-sm text-gray-500">{setting.description}</p>
                      </div>
                      <Switch
                        checked={settings[settingKey as keyof typeof settings]}
                        onCheckedChange={(value) => updateSetting(settingKey as keyof typeof settings, value)}
                        className="bg-blue-500 data-[state=checked]:bg-blue-600"
                      />
                    </div>
                    <Separator />
                  </div>
                );
              })}
            </div>

            <div className="mt-8">
              <Button
                onClick={handleSave}
                disabled={isSaving || isSaveComplete}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
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
