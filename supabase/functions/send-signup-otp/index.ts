
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting send-signup-otp function');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    console.log('Supabase client created');

    const { email, password, name, phone } = await req.json();
    console.log('Request data:', { email, name, phone, hasPassword: !!password });

    if (!email || !password || !name) {
      console.log('Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Email, password, and name are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user already exists using listUsers
    console.log('Checking if user exists...');
    const { data: users, error: listError } = await supabaseClient.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listing users:', listError);
      return new Response(
        JSON.stringify({ error: 'Failed to check existing users' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const existingUser = users.users.find(user => user.email === email);
    if (existingUser) {
      console.log('User already exists');
      return new Response(
        JSON.stringify({ error: 'User already exists' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate OTP
    console.log('Generating OTP...');
    const { data: otpData, error: otpGenError } = await supabaseClient.rpc('generate_otp');
    
    if (otpGenError || !otpData) {
      console.error('Error generating OTP:', otpGenError);
      return new Response(
        JSON.stringify({ error: 'Failed to generate OTP' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const otp = otpData;
    console.log('OTP generated:', otp);

    // Store OTP with 10 minute expiry
    console.log('Storing OTP...');
    const { error: otpError } = await supabaseClient
      .from('otp_codes')
      .insert({
        email,
        otp_code: otp,
        otp_type: 'signup',
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString()
      });

    if (otpError) {
      console.error('Error storing OTP:', otpError);
      return new Response(
        JSON.stringify({ error: 'Failed to store OTP' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Store pending user data
    console.log('Storing pending user...');
    const { error: pendingUserError } = await supabaseClient
      .from('pending_users')
      .upsert({
        email,
        password_hash: password, // In production, hash this password
        name,
        phone: phone || null
      });

    if (pendingUserError) {
      console.error('Error storing pending user:', pendingUserError);
      return new Response(
        JSON.stringify({ error: 'Failed to store user data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Signup OTP for ${email}: ${otp}`);

    return new Response(
      JSON.stringify({ 
        message: 'OTP sent successfully',
        email: email,
        otp: otp // For testing purposes - remove in production
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error in send-signup-otp:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
