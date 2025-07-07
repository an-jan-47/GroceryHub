
-- Create a function to delete all user data before deleting the user account
CREATE OR REPLACE FUNCTION delete_user_data(user_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete user data from all related tables
  DELETE FROM public.coupon_usage WHERE user_id = user_id_param;
  DELETE FROM public.order_details WHERE user_id = user_id_param;
  DELETE FROM public.order_items WHERE order_id IN (SELECT id FROM public.orders WHERE user_id = user_id_param);
  DELETE FROM public.orders WHERE user_id = user_id_param;
  DELETE FROM public.addresses WHERE user_id = user_id_param;
  DELETE FROM public.reviews WHERE user_id = user_id_param;
  DELETE FROM public.user_settings WHERE user_id = user_id_param;
  DELETE FROM public.profile_settings WHERE user_id = user_id_param;
  DELETE FROM public.admin_settings WHERE user_id = user_id_param;
  DELETE FROM public.profiles WHERE id = user_id_param;
  DELETE FROM public.user_roles WHERE user_id = user_id_param;
  DELETE FROM public.payments WHERE user_id = user_id_param;
END;
$$;
