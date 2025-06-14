import React, { useState, useEffect } from 'react';
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
import { sanitizeInput } from '@/services/securityService';

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

  // Reset form when dialog opens/closes or addressToEdit changes
  useEffect(() => {
    if (addressToEdit) {
      setFormData({
        name: addressToEdit.name,
        phone: addressToEdit.phone,
        address: addressToEdit.address,
        city: addressToEdit.city,
        state: addressToEdit.state,
        pincode: addressToEdit.pincode,
        address_type: addressToEdit.address_type || 'home', // Ensure a default value
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
      setIsSubmitting(false);
    },
    onError: (error) => {
      toast('Failed to add address', {
        description: error.message,
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
      setIsSubmitting(false);
    },
    onError: (error) => {
      toast('Failed to update address', {
        description: error.message,
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
      // Sanitize user inputs before submission
      const sanitizedData = {
        name: sanitizeInput(formData.name),
        phone: sanitizeInput(formData.phone),
        address: sanitizeInput(formData.address),
        city: sanitizeInput(formData.city),
        state: sanitizeInput(formData.state),
        pincode: sanitizeInput(formData.pincode),
        address_type: formData.address_type,
        is_default: formData.is_default
      };
      
      if (addressToEdit) {
        // Update existing address
        await updateAddressMutation.mutateAsync({
          id: addressToEdit.id,
          data: sanitizedData
        });
      } else {
        // Create new address
        await createAddressMutation.mutateAsync(sanitizedData);
      }
    } catch (error) {
      // Error handling is done in mutation callbacks
      console.error("Error in address submission:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md mx-auto my-4 p-4 sm:p-6 bg-white rounded-lg w-[95%] sm:w-full">
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
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input 
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              className="w-full"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="address">Address</Label>
            <Input 
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
              className="w-full"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="city">City</Label>
              <Input 
                id="city"
                name="city"
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
              className="flex flex-wrap space-x-2"
            >
              <div className="flex items-center space-x-2 border rounded-md p-2 flex-1 cursor-pointer hover:bg-gray-50 mb-2 sm:mb-0">
                <RadioGroupItem value="home" id="home" />
                <Label htmlFor="home" className="cursor-pointer flex items-center">
                  <Home className="w-4 h-4 mr-1" />
                  Home
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 border rounded-md p-2 flex-1 cursor-pointer hover:bg-gray-50 mb-2 sm:mb-0">
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
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="bg-[#3B82F6] hover:bg-[#2563EB] text-white w-full sm:w-auto"
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
