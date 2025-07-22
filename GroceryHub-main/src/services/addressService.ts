
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

export type Address = Database['public']['Tables']['addresses']['Row'];

export const getAddresses = async () => {
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .order('is_default', { ascending: false })
    .eq('archived', false); // Only show non-archived addresses
  
  if (error) {
    console.error('Error fetching addresses:', error);
    throw error;
  }
  
  return data;
};

export const getAddressById = async (id: string) => {
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error(`Error fetching address with id ${id}:`, error);
    throw error;
  }
  
  return data;
};

export const createAddress = async (address: Omit<Address, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'archived'>) => {
  // First get the current user
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData.user) {
    throw new Error("User not authenticated");
  }
  
  const userId = userData.user.id;
  
  // If this is the first address, set it as default
  let isDefault = address.is_default;
  if (!isDefault) {
    const { count } = await supabase
      .from('addresses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('archived', false);
    
    if (count === 0) {
      isDefault = true;
    }
  }
  
  // Then create the address
  const { data, error } = await supabase
    .from('addresses')
    .insert({
      ...address,
      is_default: isDefault,
      user_id: userId,
      archived: false
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating address:', error);
    throw error;
  }
  
  return data;
};

export const updateAddress = async (id: string, address: Partial<Omit<Address, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'archived'>>) => {
  const { data, error } = await supabase
    .from('addresses')
    .update({
      ...address,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error(`Error updating address with id ${id}:`, error);
    throw error;
  }
  
  return data;
};

export const deleteAddress = async (id: string) => {
  // First check if address is used in any orders
  const { data: orders } = await supabase
    .from('orders')
    .select('id')
    .eq('address_id', id)
    .limit(1);
  
  if (orders && orders.length > 0) {
    throw new Error("Cannot delete address that is linked to orders. Please archive instead.");
  }
  
  const { error } = await supabase
    .from('addresses')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error(`Error deleting address with id ${id}:`, error);
    throw error;
  }
  
  return true;
};

export const archiveAddress = async (id: string) => {
  const { data, error } = await supabase
    .from('addresses')
    .update({ 
      archived: true,
      is_default: false,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select();
  
  if (error) {
    console.error(`Error archiving address with id ${id}:`, error);
    throw error;
  }
  
  return true;
};

export const setDefaultAddress = async (id: string) => {
  // First, get the user ID of this address
  const { data: addressData, error: addressError } = await supabase
    .from('addresses')
    .select('user_id')
    .eq('id', id)
    .single();
  
  if (addressError) {
    console.error(`Error getting address ${id}:`, addressError);
    throw addressError;
  }
  
  // Reset all addresses for this user to non-default
  const { error: resetError } = await supabase
    .from('addresses')
    .update({ 
      is_default: false,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', addressData.user_id);
  
  if (resetError) {
    console.error(`Error resetting default addresses:`, resetError);
    throw resetError;
  }
  
  // Set this address as default
  const { data, error } = await supabase
    .from('addresses')
    .update({ 
      is_default: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error(`Error setting address ${id} as default:`, error);
    throw error;
  }
  
  return data;
};
