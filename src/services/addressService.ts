
export interface Address {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

export async function getAddressById(addressId: string): Promise<Address | null> {
  // Mock implementation - replace with actual Supabase call
  return {
    id: addressId,
    user_id: 'user_123',
    name: 'John Doe',
    phone: '+91 9876543210',
    address: '123 Main Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    is_default: true
  };
}
