
-- Create the generate_otp function if it doesn't exist
CREATE OR REPLACE FUNCTION public.generate_otp()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Generate 6-digit OTP
  RETURN LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
END;
$$;

-- Create otp_codes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.otp_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  otp_code text NOT NULL,
  otp_type text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  is_used boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create pending_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.pending_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  name text NOT NULL,
  phone text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on tables
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for otp_codes
DROP POLICY IF EXISTS "Service role can manage OTP codes" ON public.otp_codes;
CREATE POLICY "Service role can manage OTP codes" 
ON public.otp_codes 
FOR ALL 
USING (auth.role() = 'service_role');

-- Create RLS policies for pending_users
DROP POLICY IF EXISTS "Service role can manage pending users" ON public.pending_users;
CREATE POLICY "Service role can manage pending users" 
ON public.pending_users 
FOR ALL 
USING (auth.role() = 'service_role');

-- Create function to clean expired OTPs
CREATE OR REPLACE FUNCTION public.clean_expired_otps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.otp_codes 
  WHERE expires_at < now() OR is_used = TRUE;
END;
$$;
