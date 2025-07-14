
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
    console.log('Starting verify-signup-otp function');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { email, otp } = await req.json();
    console.log('Verification request:', { email, otp });

    if (!email || !otp) {
      console.log('Missing email or OTP');
      return new Response(
        JSON.stringify({ error: 'Email and OTP are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify OTP
    console.log('Verifying OTP...');
    const { data: otpRecord, error: otpError } = await supabaseClient
      .from('otp_codes')
      .select('*')
      .eq('email', email)
      .eq('otp_code', otp)
      .eq('otp_type', 'signup')
      .eq('is_used', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (otpError || !otpRecord) {
      console.log('Invalid or expired OTP:', otpError);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired OTP' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get pending user data
    console.log('Getting pending user data...');
    const { data: pendingUser, error: pendingUserError } = await supabaseClient
      .from('pending_users')
      .select('*')
      .eq('email', email)
      .single();

    if (pendingUserError || !pendingUser) {
      console.log('Pending user not found:', pendingUserError);
      return new Response(
        JSON.stringify({ error: 'Pending user data not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create user account
    console.log('Creating user account...');
    const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
      email: pendingUser.email,
      password: pendingUser.password_hash,
      email_confirm: true,
      user_metadata: {
        name: pendingUser.name,
        phone: pendingUser.phone
      }
    });

    if (authError || !authData.user) {
      console.error('Error creating user:', authError);
      return new Response(
        JSON.stringify({ error: 'Failed to create user account' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mark OTP as used
    console.log('Marking OTP as used...');
    await supabaseClient
      .from('otp_codes')
      .update({ is_used: true })
      .eq('id', otpRecord.id);

    // Clean up pending user data
    console.log('Cleaning up pending user data...');
    await supabaseClient
      .from('pending_users')
      .delete()
      .eq('email', email);

    console.log('User account created successfully:', authData.user.id);

    return new Response(
      JSON.stringify({ 
        message: 'Account created successfully',
        user: authData.user
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error in verify-signup-otp:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
