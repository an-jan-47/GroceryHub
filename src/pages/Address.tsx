import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, MapPin, Home, Briefcase, Edit, Trash2, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { toast } from '@/components/ui/sonner';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { getAddresses, Address, deleteAddress, setDefaultAddress } from '@/services/addressService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AddressDialog } from '@/components/AddressDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthCheck } from '@/hooks/useAuthCheck';

const AddressPage = () => {
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { checkAuthForCheckout } = useAuthCheck();

  // Fetch addresses from backend
  const { data: addresses = [], isLoading: isLoadingAddresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: getAddresses,
    enabled: !!user // Only fetch if user is authenticated
  });

  useEffect(() => {
    // Set the default address when addresses are loaded
    if (addresses.length > 0) {
      // First try to find a default address
      const defaultAddress = addresses.find(addr => addr.is_default);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress.id);
      } else {
        // Otherwise use the first address
        setSelectedAddress(addresses[0].id);
      }
    }
  }, [addresses]);

  // Delete address mutation
  const deleteAddressMutation = useMutation({
    mutationFn: deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast('Address removed successfully');
    },
    onError: (error) => {
      toast('Failed to remove address', {
        description: error.message
      });
    }
  });

  // Set default address mutation
  const setDefaultMutation = useMutation({
    mutationFn: setDefaultAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    }
  });

  useEffect(() => {
    // Check if user is authenticated
    checkAuthForCheckout();
  }, []);

  const handleContinue = () => {
    if (!selectedAddress) {
      toast('Please select an address to continue.');
      return;
    }
    
    // Navigate to payment page with selected address
    navigate(`/payment?address=${selectedAddress}`);
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setShowAddressDialog(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setShowAddressDialog(true);
  };

  const handleDeleteAddress = (addressId: string) => {
    deleteAddressMutation.mutate(addressId);
    
    if (selectedAddress === addressId) {
      // If we're deleting the selected address, select another one if available
      if (addresses.length > 1) {
        const newSelectedAddress = addresses.find(addr => addr.id !== addressId);
        if (newSelectedAddress) setSelectedAddress(newSelectedAddress.id);
      } else {
        setSelectedAddress('');
      }
    }
  };

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddress(addressId);
    // When selecting an address, also set it as default
    setDefaultMutation.mutate(addressId);
  };

  const getAddressIcon = (type: string) => {
    if (type === 'home') return <Home className="w-4 h-4" />;
    if (type === 'work') return <Briefcase className="w-4 h-4" />;
    return <MapPin className="w-4 h-4" />;
  };
  
  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      <Header />
      
      <main className="container px-4 py-4 mx-auto max-w-3xl">
        <div className="py-3 flex items-center">
          <Link to="/cart" className="flex items-center text-gray-500">
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span>Back to Cart</span>
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <h1 className="text-xl font-bold mb-4">Select Delivery Address</h1>
          
          {isLoadingAddresses ? (
            <div className="py-8 flex justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
          ) : addresses.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
              <MapPin className="mx-auto w-12 h-12 text-gray-400 mb-2" />
              <p className="text-gray-600 mb-4">No saved addresses found</p>
              <Button onClick={handleAddAddress} className="bg-blue-500">
                Add New Address
              </Button>
            </div>
          ) : (
            <div>
              <RadioGroup 
                value={selectedAddress} 
                onValueChange={handleAddressSelect}
                className="space-y-3"
              >
                {addresses.map(address => (
                  <div 
                    key={address.id} 
                    className={`p-4 border rounded-lg flex ${
                      selectedAddress === address.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start">
                      <RadioGroupItem 
                        value={address.id} 
                        id={`address-${address.id}`} 
                        className="mt-1"
                      />
                      <div className="ml-3 flex-grow">
                        <div className="flex items-center flex-wrap gap-2">
                          <Label 
                            htmlFor={`address-${address.id}`} 
                            className="font-medium cursor-pointer"
                          >
                            {address.name}
                          </Label>
                          
                          <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                            {getAddressIcon(address.address_type)}
                            <span className="uppercase">{address.address_type}</span>
                          </div>
                          
                          {address.is_default && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-1">{address.phone}</p>
                        <p className="text-sm text-gray-700 mt-1">
                          {address.address}, {address.city}, {address.state} {address.pincode}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2 ml-auto">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-2"
                        onClick={() => handleEditAddress(address)}
                      >
                        <Edit className="h-4 w-4 text-blue-500" />
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-2"
                        onClick={() => handleDeleteAddress(address.id)}
                        disabled={deleteAddressMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </RadioGroup>
              
              <div className="mt-4 flex items-center justify-between">
                <Button 
                  variant="outline" 
                  onClick={handleAddAddress}
                  className="border-dashed border-gray-300 flex items-center text-blue-500"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add New Address
                </Button>
                
                <Button 
                  onClick={handleContinue}
                  className="bg-orange-500 hover:bg-orange-600"
                  disabled={!selectedAddress || addresses.length === 0}
                >
                  Deliver to this Address
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="font-medium mb-3">Delivery Options</h2>
          <div className="flex items-center justify-between border-t border-gray-100 py-3">
            <div className="flex items-center">
              <Truck className="text-green-600 w-5 h-5 mr-3" />
              <div>
                <p className="font-medium text-sm">Standard Delivery</p>
                <p className="text-xs text-gray-500">Get by Friday, 10th May</p>
              </div>
            </div>
            <span className="text-green-600 font-medium text-sm">FREE</span>
          </div>
        </div>
      </main>
      
      <BottomNavigation />
      
      {/* Address Add/Edit Dialog */}
      <AddressDialog
        open={showAddressDialog}
        onOpenChange={setShowAddressDialog}
        addressToEdit={editingAddress}
      />
    </div>
  );
};

export default AddressPage;
