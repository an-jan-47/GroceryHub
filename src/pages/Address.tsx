
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, MapPin, Home, Briefcase, Edit, Trash2, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';

// Define the Address type to match the existing data structure
interface Address {
  id: string;
  addressType: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

// Sample saved addresses
const INITIAL_ADDRESSES: Address[] = [
  {
    id: '1',
    addressType: 'home',
    name: 'John Doe',
    phone: '1234567890',
    address: '123 Main Street',
    city: 'New York',
    state: 'NY',
    pincode: '10001',
    isDefault: true,
  },
  {
    id: '2',
    addressType: 'work',
    name: 'John Doe',
    phone: '9876543210',
    address: '456 Business Avenue',
    city: 'San Francisco',
    state: 'CA',
    pincode: '94107',
    isDefault: false,
  },
];

const AddressPage = () => {
  const [savedAddresses, setSavedAddresses] = useState<Address[]>(INITIAL_ADDRESSES);
  const [selectedAddress, setSelectedAddress] = useState<string>(savedAddresses[0]?.id || '');
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleContinue = () => {
    // Log which address was selected
    console.log('Selected address ID:', selectedAddress);
    
    if (!selectedAddress) {
      toast({
        title: "Select an Address",
        description: "Please select an address to continue.",
        variant: "destructive",
      });
      return;
    }
    
    // Navigate to payment page
    navigate('/payment');
  };

  const handleAddAddress = () => {
    // Navigate to add address page or show add address form
    toast({
      title: "Add Address",
      description: "This would open the add address form.",
    });
  };

  const handleEditAddress = (addressId: string) => {
    toast({
      title: "Edit Address",
      description: `Editing address ${addressId}`,
    });
  };

  const handleDeleteAddress = (addressId: string) => {
    setSavedAddresses(savedAddresses.filter(addr => addr.id !== addressId));
    
    if (selectedAddress === addressId) {
      setSelectedAddress(savedAddresses.find(addr => addr.id !== addressId)?.id || '');
    }
    
    toast({
      title: "Address Removed",
      description: "Address has been removed successfully",
    });
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
          
          {savedAddresses.length === 0 ? (
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
                onValueChange={setSelectedAddress}
                className="space-y-3"
              >
                {savedAddresses.map(address => (
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
                            {getAddressIcon(address.addressType)}
                            <span className="uppercase">{address.addressType}</span>
                          </div>
                          
                          {address.isDefault && (
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
                        onClick={() => handleEditAddress(address.id)}
                      >
                        <Edit className="h-4 w-4 text-blue-500" />
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-2"
                        onClick={() => handleDeleteAddress(address.id)}
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
    </div>
  );
};

export default AddressPage;
