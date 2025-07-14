
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { email, otp } = await req.json();

    if (!email || !otp) {
      return new Response(
        JSON.stringify({ error: 'Email and OTP are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify OTP
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
      return new Response(
        JSON.stringify({ error: 'Invalid or expired OTP' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get pending user data
    const { data: pendingUser, error: pendingError } = await supabaseClient
      .from('pending_users')
      .select('*')
      .eq('email', email)
      .single();

    if (pendingError || !pendingUser) {
      return new Response(
        JSON.stringify({ error: 'Pending user data not found' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create user account using the admin API
    const { data: userData, error: userError } = await supabaseClient.auth.admin.createUser({
      email: email,
      password: pendingUser.password_hash,
      email_confirm: true,
      user_metadata: {
        name: pendingUser.name,
        phone: pendingUser.phone
      }
    });

    if (userError) {
      console.error('Error creating user:', userError);
      return new Response(
        JSON.stringify({ error: 'Failed to create user account' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mark OTP as used
    await supabaseClient
      .from('otp_codes')
      .update({ is_used: true })
      .eq('id', otpRecord.id);

    // Clean up pending user data
    await supabaseClient
      .from('pending_users')
      .delete()
      .eq('email', email);

    return new Response(
      JSON.stringify({ 
        message: 'Account verified successfully',
        user: userData.user
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
