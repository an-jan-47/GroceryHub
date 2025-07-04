import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Plus, MapPin, Home, Briefcase, Edit, Trash2, Truck, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { getAddresses, Address, deleteAddress, setDefaultAddress, archiveAddress } from '@/services/addressService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AddressDialog } from '@/components/AddressDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthCheck } from '@/hooks/useAuthCheck';

const AddressPage = () => {
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { checkAuthForCheckout } = useAuthCheck();

  const isCheckout = searchParams.get('checkout') !== 'false' && searchParams.get('checkout') !== null;

  const { data: addresses = [], isLoading: isLoadingAddresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: getAddresses,
    enabled: !!user
  });

  useEffect(() => {
    if (addresses.length > 0) {
      const defaultAddress = addresses.find(addr => addr.is_default);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress.id);
      } else {
        setSelectedAddress(addresses[0].id);
      }
    }
  }, [addresses]);

  const deleteAddressMutation = useMutation({
    mutationFn: async (addressId: string) => {
      try {
        return await deleteAddress(addressId);
      } catch (error) {
        if (error.message?.includes('linked to orders')) {
          return await archiveAddress(addressId);
        }
        throw error;
      }
    },
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

  const setDefaultMutation = useMutation({
    mutationFn: setDefaultAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    }
  });

  useEffect(() => {
    checkAuthForCheckout();
  }, []);

  const handleContinue = () => {
    if (!selectedAddress) {
      toast('Please select an address to continue.');
      return;
    }
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
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">Select Delivery Address</h1>

            <Button
              variant="outline"
              onClick={handleAddAddress}
              className="border-dashed border-gray-300 flex items-center text-[#3B82F6]"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add New
            </Button>
          </div>

          {addresses.length === 0 && !isLoadingAddresses && (
            <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
              <MapPin className="mx-auto w-12 h-12 text-gray-400 mb-2" />
              <p className="text-gray-600 mb-4">No saved addresses found</p>
              <Button onClick={handleAddAddress} className="bg-[#3B82F6] hover:bg-[#2563EB] text-white">
                Add New Address
              </Button>
            </div>
          )}

          {isLoadingAddresses ? (
            <div className="py-8 flex justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
          ) : addresses.length > 0 ? (
            <div>
              <RadioGroup value={selectedAddress} onValueChange={handleAddressSelect} className="space-y-3">
                {addresses
                  .filter(address => !address.archived)
                  .map(address => (
                    <div
                      key={address.id}
                      className={`p-3 sm:p-4 border rounded-lg flex flex-col sm:flex-row ${
                        selectedAddress === address.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start flex-1">
                        <RadioGroupItem value={address.id} id={`address-${address.id}`} className="mt-1" />
                        <div className="ml-3 flex-grow">
                          <div className="flex items-center flex-wrap gap-2">
                            <Label htmlFor={`address-${address.id}`} className="font-medium cursor-pointer">
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

                      <div className="flex flex-row sm:flex-col justify-end space-x-2 sm:space-x-0 sm:space-y-2 mt-3 sm:mt-0">
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

              <div className="bg-white rounded-lg shadow-sm p-4">
                <Button
                  className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white py-3 rounded-lg font-medium text-lg flex items-center justify-center gap-2"
                  onClick={handleContinue}
                  disabled={!selectedAddress}
                >
                  <Truck className="w-5 h-5" />
                  Deliver to this Address
                </Button>
              </div>
            </div>
          ) : null}
        </div>

        {isCheckout && (
          <>
            <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
              <h2 className="font-medium mb-3">Delivery Options</h2>
              <div className="flex items-center justify-between border-t border-gray-100 py-3">
                <div className="flex items-center">
                  <Truck className="text-green-600 w-5 h-5 mr-3" />
                  <div>
                    <p className="font-medium text-sm">Standard Delivery</p>
                    <p className="text-xs text-gray-500">Get it within 7 day at almost all Pincodes </p>
                  </div>
                </div>
                <span className="text-green-600 font-medium text-sm">FREE</span>
              </div>
            </div>

            <Alert variant="default" className="bg-blue-50 border-blue-200">
              <Shield className="h-4 w-4 text-blue-500" />
              <AlertTitle className="text-blue-700">Secure Checkout</AlertTitle>
              <AlertDescription className="text-blue-600 text-sm">
                Your personal and payment information is protected with industry-standard encryption.
              </AlertDescription>
            </Alert>
          </>
        )}
      </main>

      <BottomNavigation />

      <AddressDialog open={showAddressDialog} onOpenChange={setShowAddressDialog} addressToEdit={editingAddress} />
    </div>
  );
};

export default AddressPage;
