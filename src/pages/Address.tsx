
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';

// Address form schema
const addressSchema = z.object({
  addressType: z.enum(['home', 'work', 'other']),
  name: z.string().min(2, { message: 'Name is required' }),
  phone: z.string().min(10, { message: 'Valid phone number is required' }),
  address: z.string().min(5, { message: 'Address is required' }),
  city: z.string().min(2, { message: 'City is required' }),
  state: z.string().min(2, { message: 'State is required' }),
  pincode: z.string().min(5, { message: 'Valid pincode is required' }),
});

type AddressFormValues = z.infer<typeof addressSchema>;

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
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
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
    
    // Create new address and add it to the start of the list
    const newAddress: Address = {
      id: `new-${Date.now()}`, // Generate a unique ID
      addressType: data.addressType,
      name: data.name,
      phone: data.phone,
      address: data.address,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      isDefault: false,
    };
    
    // Update addresses list with new address first
    const updatedAddresses: Address[] = [newAddress, ...savedAddresses];
    setSavedAddresses(updatedAddresses);
    
    // Select the new address
    setSelectedAddress(newAddress.id);
    
    // Hide the form
    setShowNewAddressForm(false);
    
    // Show success message
    toast({
      title: "Address Added",
      description: "Your new address has been added successfully.",
    });
  };
  
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
        
        <Tabs defaultValue="saved" className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="saved">Saved Addresses</TabsTrigger>
            <TabsTrigger value="new" onClick={() => setShowNewAddressForm(true)}>Add New Address</TabsTrigger>
          </TabsList>
          
          <TabsContent value="saved" className="space-y-4">
            {savedAddresses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No saved addresses found</p>
                <Button 
                  onClick={() => setShowNewAddressForm(true)}
                  className="bg-brand-blue hover:bg-brand-darkBlue"
                >
                  Add New Address
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress}>
                  {savedAddresses.map(address => (
                    <Card key={address.id} className={`border cursor-pointer transition-all ${selectedAddress === address.id ? 'border-brand-blue ring-1 ring-brand-blue' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start">
                          <RadioGroupItem value={address.id} id={`address-${address.id}`} className="mt-1" />
                          <div className="ml-3">
                            <Label htmlFor={`address-${address.id}`} className="flex items-center cursor-pointer">
                              <span className="font-medium">{address.name}</span>
                              <span className="ml-2 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full uppercase">
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
                      </CardContent>
                    </Card>
                  ))}
                </RadioGroup>
                
                <Button 
                  onClick={handleContinue}
                  className="w-full bg-brand-blue hover:bg-brand-darkBlue"
                >
                  Deliver to this Address
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="new">
            {showNewAddressForm && (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid gap-4">
                    <FormField
                      control={form.control}
                      name="addressType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address Type</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select address type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="home">Home</SelectItem>
                              <SelectItem value="work">Work</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
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
                              <Input placeholder="1234567890" {...field} />
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
                            <Input placeholder="123 Main Street" {...field} />
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
                              <Input placeholder="New York" {...field} />
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
                              <Input placeholder="NY" {...field} />
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
                          <FormLabel>PIN Code</FormLabel>
                          <FormControl>
                            <Input placeholder="10001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      type="submit"
                      className="flex-1 bg-brand-blue hover:bg-brand-darkBlue"
                    >
                      Save & Deliver Here
                    </Button>
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => setShowNewAddressForm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default AddressPage;
