
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
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
  
  return (
    <div className="pb-20">
      <Header />
      
      <main className="container px-4 py-4 mx-auto">
        <div className="py-3 flex items-center">
          <Link to="/cart" className="flex items-center text-gray-500">
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span>Back to Cart</span>
          </Link>
        </div>
        
        <h1 className="text-2xl font-bold mb-6">Shipping Address</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-lg">Saved Addresses</h2>
            </div>
            
            {savedAddresses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No saved addresses found</p>
              </div>
            ) : (
              <div className="space-y-4">
                <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress}>
                  {savedAddresses.map(address => (
                    <div key={address.id} className={`p-4 border rounded-lg ${selectedAddress === address.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                      <div className="flex items-start">
                        <RadioGroupItem value={address.id} id={`address-${address.id}`} className="mt-1" />
                        <div className="ml-3">
                          <Label htmlFor={`address-${address.id}`} className="flex items-center cursor-pointer">
                            <span className="font-medium">{address.name}</span>
                            <span className="ml-2 text-xs uppercase bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                              {address.addressType}
                            </span>
                            {address.isDefault && (
                              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                Default
                              </span>
                            )}
                          </Label>
                          <p className="text-sm text-gray-600 mt-1">{address.phone}</p>
                          <p className="text-sm text-gray-600 mt-2">
                            {address.address}, {address.city}, {address.state} {address.pincode}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 shadow-sm flex justify-center items-center">
            <Button 
              onClick={handleAddAddress}
              variant="outline" 
              className="w-full h-12 text-base"
            >
              Add New Address
            </Button>
          </div>
        </div>
        
        <div className="mt-8">
          <Button 
            onClick={handleContinue}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white h-12 text-base"
          >
            Deliver to this Address
          </Button>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default AddressPage;
