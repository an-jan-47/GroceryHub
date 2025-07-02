
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface AddressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (address: any) => void;
}

export default function AddressDialog({ open, onOpenChange, onSave }: AddressDialogProps) {
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  });

  const handleSave = () => {
    onSave(address);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Address</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="street">Street Address</Label>
            <Input
              id="street"
              value={address.street}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                setAddress(prev => ({ ...prev, street: e.target.value }))
              }
            />
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={address.city}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                setAddress(prev => ({ ...prev, city: e.target.value }))
              }
            />
          </div>
          <div>
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              value={address.state}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                setAddress(prev => ({ ...prev, state: e.target.value }))
              }
            />
          </div>
          <div>
            <Label htmlFor="zipCode">ZIP Code</Label>
            <Input
              id="zipCode"
              value={address.zipCode}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                setAddress(prev => ({ ...prev, zipCode: e.target.value }))
              }
            />
          </div>
          <Button onClick={handleSave} className="w-full">
            Save Address
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
