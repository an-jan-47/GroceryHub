import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Package, CreditCard, User, Lock, LogOut, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });
  
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
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
        
        if (error) throw error;
        
        if (data) {
          setProfile(data);
          setFormData({
            name: data.name || '',
            phone: data.phone || ''
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast('Error fetching profile', {
          description: 'Could not load your profile information'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [user]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSaveChanges = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          phone: formData.phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Update local state
      setProfile(prev => prev ? {
        ...prev,
        name: formData.name,
        phone: formData.phone,
        updated_at: new Date().toISOString()
      } : null);
      
      setIsEditing(false);
      toast('Profile updated', {
        description: 'Your profile information has been updated successfully'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast('Error updating profile', {
        description: 'Could not update your profile information'
      });
    }
  };
  
  const handleCancelEdit = () => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        phone: profile.phone || ''
      });
    }
    setIsEditing(false);
  };
  
  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };
  
  if (isLoading) {
    return (
      <div className="pb-20">
        <Header />
        <div className="container px-4 py-8 mx-auto flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-blue"></div>
        </div>
        <BottomNavigation />
      </div>
    );
  }
  
  return (
    <div className="pb-20">
      <Header />
      
      <main className="container px-4 py-4 mx-auto">
        <div className="py-3 flex items-center">
          <Link to="/" className="flex items-center text-gray-500">
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span>Back</span>
          </Link>
        </div>
        
        <h1 className="text-2xl font-bold mb-6">Profile</h1>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {isEditing ? (
            <div className="p-4">
              <h2 className="font-semibold text-lg mb-4">Edit Profile</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <Input 
                    id="name" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <Input 
                    id="email" 
                    value={user?.email || ''} 
                    disabled 
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <Input 
                    id="phone" 
                    name="phone" 
                    value={formData.phone || ''} 
                    onChange={handleInputChange} 
                  />
                </div>
                
                <div className="flex gap-3 pt-2">
                  <Button 
                    onClick={handleCancelEdit}
                    variant="outline" 
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveChanges}
                    className="flex-1 bg-brand-blue hover:bg-brand-darkBlue"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    <User className="w-7 h-7 text-gray-500" />
                  </div>
                  <div className="ml-3">
                    <h2 className="font-semibold">{profile?.name || 'User'}</h2>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                </div>
                <Button 
                  onClick={() => setIsEditing(true)}
                  variant="outline" 
                  size="sm"
                >
                  Edit
                </Button>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">My Account</h3>
                  <div className="mt-2 space-y-2">
                    <Link to="/orders" className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50">
                      <div className="flex items-center">
                        <Package className="w-5 h-5 text-gray-400 mr-3" />
                        <span>Order History</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </Link>
                    
                    <Link to="/addresses" className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50">
                      <div className="flex items-center">
                        <CreditCard className="w-5 h-5 text-gray-400 mr-3" />
                        <span>Payment Methods</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </Link>
                    
                    <Link to="/password" className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50">
                      <div className="flex items-center">
                        <Lock className="w-5 h-5 text-gray-400 mr-3" />
                        <span>Change Password</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </Link>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">App Settings</h3>
                  <div className="mt-2 space-y-2">
                    <Link to="/notifications" className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50">
                      <div className="flex items-center">
                        <span>Notifications</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </Link>
                    
                    <Link to="/privacy" className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50">
                      <div className="flex items-center">
                        <span>Privacy Settings</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </Link>
                    
                    <Link to="/about" className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50">
                      <div className="flex items-center">
                        <span>About Us</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </Link>
                  </div>
                </div>
                
                <Separator />
                
                <Button 
                  onClick={handleLogout}
                  variant="outline" 
                  className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default ProfilePage;
