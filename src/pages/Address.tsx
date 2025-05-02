
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';

const addressSchema = z.object({
  addressType: z.enum(['home', 'work', 'other']),
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().min(6, 'Valid pincode is required'),
});

type AddressFormValues = z.infer<typeof addressSchema>;

// Sample saved addresses
const SAVED_ADDRESSES = [
  {
    id: '1',
    addressType: 'home',
    name: 'John Doe',
    phone: '9876543210',
    address: '123 Main Street, Apartment 4B',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560001',
    isDefault: true,
  },
  {
    id: '2',
    addressType: 'work',
    name: 'John Doe',
    phone: '9876543210',
    address: '456 Office Park, Building 2',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560002',
    isDefault: false,
  },
];

const AddressPage = () => {
  const [selectedAddress, setSelectedAddress] = useState<string>(SAVED_ADDRESSES[0].id);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const navigate = useNavigate();
  
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      addressType: 'home',
      name: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
    },
  });

  const onSubmit = (data: AddressFormValues) => {
    console.log('New address:', data);
    // In a real app, would save to database here
    navigate('/payment');
  };
  
  const handleContinue = () => {
    if (showNewAddressForm) {
      form.handleSubmit(onSubmit)();
    } else {
      console.log('Selected address ID:', selectedAddress);
      navigate('/payment');
    }
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
        
        {!showNewAddressForm && (
          <div>
            <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress} className="space-y-3">
              {SAVED_ADDRESSES.map((address) => (
                <div key={address.id} className="flex items-center space-x-2 border rounded-lg p-4">
                  <RadioGroupItem value={address.id} id={`address-${address.id}`} />
                  <Label htmlFor={`address-${address.id}`} className="flex-1 cursor-pointer">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{address.name}</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded uppercase">{address.addressType}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{address.phone}</p>
                      <p className="text-sm text-gray-600 mt-1">{address.address}, {address.city}, {address.state} - {address.pincode}</p>
                      {address.isDefault && <span className="text-xs text-brand-blue mt-2 inline-block">Default Address</span>}
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
            
            <Button 
              onClick={() => setShowNewAddressForm(true)}
              variant="outline" 
              className="w-full mt-4 border-dashed"
            >
              + Add New Address
            </Button>
          </div>
        )}
        
        {showNewAddressForm && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="addressType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Type</FormLabel>
                    <div className="flex gap-4">
                      <FormControl>
                        <RadioGroup 
                          onValueChange={field.onChange} 
                          defaultValue={field.value} 
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="home" id="home" />
                            <Label htmlFor="home">Home</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="work" id="work" />
                            <Label htmlFor="work">Work</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="other" id="other" />
                            <Label htmlFor="other">Other</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="9876543210" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Street address, apartment, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="City" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="State" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="pincode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pincode</FormLabel>
                    <FormControl>
                      <Input placeholder="Pincode" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex gap-3 pt-2">
                <Button 
                  type="button"
                  onClick={() => setShowNewAddressForm(false)}
                  variant="outline" 
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="flex-1 bg-brand-blue hover:bg-brand-darkBlue"
                >
                  Save & Continue
                </Button>
              </div>
            </form>
          </Form>
        )}
        
        {!showNewAddressForm && (
          <div className="mt-6 sticky bottom-20 bg-white pt-4 pb-4">
            <Button 
              onClick={handleContinue}
              className="w-full bg-brand-blue hover:bg-brand-darkBlue"
            >
              Continue to Payment
            </Button>
          </div>
        )}
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default AddressPage;
