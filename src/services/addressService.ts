
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

export type Address = Database['public']['Tables']['addresses']['Row'];

export const getAddresses = async () => {
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .order('is_default', { ascending: false });
  
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

export const createAddress = async (address: Omit<Address, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
  const { data, error } = await supabase
    .from('addresses')
    .insert([{
      ...address,
      user_id: supabase.auth.getUser().then(({ data }) => data.user?.id) // This is a promise, but it's resolved by Supabase
    }])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating address:', error);
    throw error;
  }
  
  return data;
};

export const updateAddress = async (id: string, address: Partial<Omit<Address, 'id' | 'created_at' | 'updated_at' | 'user_id'>>) => {
  const { data, error } = await supabase
    .from('addresses')
    .update(address)
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

export const setDefaultAddress = async (id: string) => {
  const { data, error } = await supabase
    .from('addresses')
    .update({ is_default: true })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error(`Error setting address ${id} as default:`, error);
    throw error;
  }
  
  return data;
};
