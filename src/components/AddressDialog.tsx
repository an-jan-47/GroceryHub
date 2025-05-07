
import { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/components/ui/sonner';
import { Home, Briefcase, MapPin } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAddress, updateAddress, Address } from '@/services/addressService';
import { Switch } from '@/components/ui/switch';

interface AddressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addressToEdit: Address | null;
}

export const AddressDialog = ({ open, onOpenChange, addressToEdit }: AddressDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    address_type: 'home',
    is_default: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (addressToEdit) {
      setFormData({
        name: addressToEdit.name,
        phone: addressToEdit.phone,
        address: addressToEdit.address,
        city: addressToEdit.city,
        state: addressToEdit.state,
        pincode: addressToEdit.pincode,
        address_type: addressToEdit.address_type,
        is_default: addressToEdit.is_default || false
      });
    } else {
      // Reset form for new address
      setFormData({
        name: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        address_type: 'home',
        is_default: false
      });
    }
  }, [addressToEdit, open]);

  // Create address mutation
  const createAddressMutation = useMutation({
    mutationFn: createAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast('Address added successfully');
      onOpenChange(false);
    },
    onError: (error) => {
      toast('Failed to add address', {
        description: error.message
      });
      setIsSubmitting(false);
    }
  });

  // Update address mutation
  const updateAddressMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Address> }) => 
      updateAddress(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast('Address updated successfully');
      onOpenChange(false);
    },
    onError: (error) => {
      toast('Failed to update address', {
        description: error.message
      });
      setIsSubmitting(false);
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, is_default: checked }));
  };

  const handleAddressTypeChange = (value: string) => {
    setFormData(prev => ({ ...prev, address_type: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (addressToEdit) {
        // Update existing address
        await updateAddressMutation.mutateAsync({
          id: addressToEdit.id,
          data: formData
        });
      } else {
        // Create new address
        await createAddressMutation.mutateAsync(formData);
      }
    } catch (error) {
      // Error handling is done in mutation callbacks
      console.error("Error in address submission:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{addressToEdit ? 'Edit Address' : 'Add New Address'}</DialogTitle>
          <DialogDescription>
            {addressToEdit 
              ? 'Update your delivery address details below.' 
              : 'Enter your delivery address details below.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input 
              id="name"
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input 
              id="phone"
              name="phone"
              placeholder="1234567890"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="address">Address</Label>
            <Input 
              id="address"
              name="address"
              placeholder="123 Main Street, Apt 4B"
              value={formData.address}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="city">City</Label>
              <Input 
                id="city"
                name="city"
                placeholder="New York"
                value={formData.city}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="state">State</Label>
              <Input 
                id="state"
                name="state"
                placeholder="NY"
                value={formData.state}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="pincode">Pincode / ZIP Code</Label>
            <Input 
              id="pincode"
              name="pincode"
              placeholder="10001"
              value={formData.pincode}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label>Address Type</Label>
            <RadioGroup 
              value={formData.address_type}
              onValueChange={handleAddressTypeChange}
              className="flex space-x-2"
            >
              <div className="flex items-center space-x-2 border rounded-md p-2 flex-1 cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="home" id="home" />
                <Label htmlFor="home" className="cursor-pointer flex items-center">
                  <Home className="w-4 h-4 mr-1" />
                  Home
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 border rounded-md p-2 flex-1 cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="work" id="work" />
                <Label htmlFor="work" className="cursor-pointer flex items-center">
                  <Briefcase className="w-4 h-4 mr-1" />
                  Work
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 border rounded-md p-2 flex-1 cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other" className="cursor-pointer flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  Other
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="is_default"
              checked={formData.is_default}
              onCheckedChange={handleSwitchChange}
            />
            <Label htmlFor="is_default">Set as default address</Label>
          </div>
          
          <DialogFooter className="pt-4">
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="bg-brand-blue"
            >
              {isSubmitting 
                ? 'Saving...' 
                : addressToEdit ? 'Update Address' : 'Save Address'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
