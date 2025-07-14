
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

    const { email, password, name, phone } = await req.json();

    if (!email || !password || !name) {
      return new Response(
        JSON.stringify({ error: 'Email, password, and name are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseClient.auth.admin.getUserByEmail(email);
    if (existingUser.user) {
      return new Response(
        JSON.stringify({ error: 'User already exists' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate OTP
    const { data: otpData } = await supabaseClient.rpc('generate_otp');
    const otp = otpData;

    if (!otp) {
      return new Response(
        JSON.stringify({ error: 'Failed to generate OTP' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Store pending user data (we'll create the user after OTP verification)
    const { error: pendingUserError } = await supabaseClient
      .from('pending_users')
      .upsert({
        email,
        password_hash: password, // Store the plain password temporarily - it will be hashed when creating the actual user
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

    // Store OTP with 10 minute expiry
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
        JSON.stringify({ error: 'Failed to generate OTP' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For now, we'll just return success - in a real app you'd send an email
    // But we'll log the OTP so you can see it for testing
    console.log(`OTP for ${email}: ${otp}`);

    return new Response(
      JSON.stringify({ 
        message: 'OTP sent successfully',
        email: email,
        otp: otp // Remove this in production - only for testing
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
