import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface Address {
  id: string;
  user_id: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  archived: boolean;
}

const Address: React.FC = () => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [newAddress, setNewAddress] = useState<Omit<Address, 'id' | 'user_id' | 'is_default' | 'archived'>>({
    street: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
  });
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedAddress, setEditedAddress] = useState<Omit<Address, 'user_id' | 'id' | 'is_default' | 'archived'>>({
    street: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
  });

  useEffect(() => {
    fetchAddresses();
  }, [user]);

  const fetchAddresses = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .eq('archived', false)
        .order('is_default', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load addresses';
      toast('Error loading addresses', {
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, field: keyof Omit<Address, 'id' | 'user_id' | 'is_default' | 'archived'>) => {
    setNewAddress({ ...newAddress, [field]: e.target.value });
  };

  const handleAddAddress = async () => {
    if (!user) return;

    setAdding(true);
    try {
      const { error } = await supabase
        .from('addresses')
        .insert([
          {
            user_id: user.id,
            ...newAddress,
            is_default: false,
            archived: false,
          },
        ]);

      if (error) throw error;
      setNewAddress({
        street: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
      });
      fetchAddresses();
      toast('Address added successfully');
    } catch (error) {
      console.error('Error adding address:', error);
      toast('Error adding address');
    } finally {
      setAdding(false);
    }
  };

  const handleEditClick = (address: Address) => {
    setEditingId(address.id);
    setEditedAddress({
      street: address.street,
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      country: address.country,
    });
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, field: keyof Omit<Address, 'id' | 'user_id' | 'is_default' | 'archived'>) => {
    setEditedAddress({ ...editedAddress, [field]: e.target.value });
  };

  const handleUpdateAddress = async () => {
    if (!user || !editingId) return;

    setAdding(true);
    try {
      const { error } = await supabase
        .from('addresses')
        .update(editedAddress)
        .eq('id', editingId);

      if (error) throw error;
      setEditingId(null);
      fetchAddresses();
      toast('Address updated successfully');
    } catch (error) {
      console.error('Error updating address:', error);
      toast('Error updating address');
    } finally {
      setAdding(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSetDefault = async (addressId: string) => {
    if (!user) return;
  
    try {
      setLoading(true);
  
      // First, set all addresses to false
      const { error: resetError } = await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);
  
      if (resetError) {
        console.error('Error resetting default addresses:', resetError);
        throw resetError;
      }
  
      // Then, set the selected address to true
      const { error: updateError } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', addressId);
  
      if (updateError) {
        console.error('Error setting default address:', updateError);
        throw updateError;
      }
  
      fetchAddresses();
      toast('Default address updated');
    } catch (error) {
      console.error('Error setting default address:', error);
      toast('Error setting default address');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!user) return;
  
    try {
      setLoading(true);
  
      // Archive the address instead of deleting
      const { error: archiveError } = await supabase
        .from('addresses')
        .update({ archived: true })
        .eq('id', addressId);
  
      if (archiveError) {
        console.error('Error archiving address:', archiveError);
        throw archiveError;
      }
  
      fetchAddresses();
      toast('Address deleted successfully');
    } catch (error) {
      console.error('Error deleting address:', error);
      toast('Error deleting address');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading addresses...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Addresses</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map((address) => (
          <Card key={address.id}>
            <CardHeader>
              <CardTitle>{address.street}, {address.city}</CardTitle>
              <CardDescription>
                {address.state}, {address.postal_code}, {address.country}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {address.is_default && <div className="text-green-500">Default Address</div>}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div>
                {!address.is_default && (
                  <Button size="sm" onClick={() => handleSetDefault(address.id)}>
                    Set as Default
                  </Button>
                )}
              </div>
              <div>
                <Button size="sm" variant="secondary" onClick={() => handleEditClick(address)}>
                  Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDeleteAddress(address.id)}>
                  Delete
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Add New Address</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="street">Street</Label>
            <Input
              type="text"
              id="street"
              value={newAddress.street}
              onChange={(e) => handleInputChange(e, 'street')}
            />
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              type="text"
              id="city"
              value={newAddress.city}
              onChange={(e) => handleInputChange(e, 'city')}
            />
          </div>
          <div>
            <Label htmlFor="state">State</Label>
            <Input
              type="text"
              id="state"
              value={newAddress.state}
              onChange={(e) => handleInputChange(e, 'state')}
            />
          </div>
          <div>
            <Label htmlFor="postal_code">Postal Code</Label>
            <Input
              type="text"
              id="postal_code"
              value={newAddress.postal_code}
              onChange={(e) => handleInputChange(e, 'postal_code')}
            />
          </div>
          <div>
            <Label htmlFor="country">Country</Label>
            <Input
              type="text"
              id="country"
              value={newAddress.country}
              onChange={(e) => handleInputChange(e, 'country')}
            />
          </div>
        </div>
        <Button className="mt-4" disabled={adding} onClick={handleAddAddress}>
          {adding ? 'Adding...' : 'Add Address'}
        </Button>
      </div>

      {editingId && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Edit Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit_street">Street</Label>
              <Input
                type="text"
                id="edit_street"
                value={editedAddress.street}
                onChange={(e) => handleEditInputChange(e, 'street')}
              />
            </div>
            <div>
              <Label htmlFor="edit_city">City</Label>
              <Input
                type="text"
                id="edit_city"
                value={editedAddress.city}
                onChange={(e) => handleEditInputChange(e, 'city')}
              />
            </div>
            <div>
              <Label htmlFor="edit_state">State</Label>
              <Input
                type="text"
                id="edit_state"
                value={editedAddress.state}
                onChange={(e) => handleEditInputChange(e, 'state')}
              />
            </div>
            <div>
              <Label htmlFor="edit_postal_code">Postal Code</Label>
              <Input
                type="text"
                id="edit_postal_code"
                value={editedAddress.postal_code}
                onChange={(e) => handleEditInputChange(e, 'postal_code')}
              />
            </div>
            <div>
              <Label htmlFor="edit_country">Country</Label>
              <Input
                type="text"
                id="edit_country"
                value={editedAddress.country}
                onChange={(e) => handleEditInputChange(e, 'country')}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button disabled={adding} onClick={handleUpdateAddress}>
              {adding ? 'Updating...' : 'Update Address'}
            </Button>
            <Button variant="secondary" onClick={handleCancelEdit}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Address;
