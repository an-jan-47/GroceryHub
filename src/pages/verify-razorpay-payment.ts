import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import * as crypto from 'https://deno.land/std@0.177.0/crypto/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { paymentId, orderId, signature, razorpayOrderId } = await req.json();
    
    // Create a Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Razorpay API credentials
    const key_secret = Deno.env.get('RAZORPAY_KEY_SECRET');
    
    if (!key_secret) {
      throw new Error('Razorpay API credentials not configured');
    }
    
    // Verify the payment signature
    const generatedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(`${razorpayOrderId}|${paymentId}`)
      .digest('hex');
    
    if (generatedSignature !== signature) {
      throw new Error('Invalid payment signature');
    }
    
    // Update order status in database
    const { error: updateError } = await supabaseClient
      .from('orders')
      .update({ status: 'Processing', payment_status: 'Paid' })
      .eq('id', orderId);
    
    if (updateError) {
      throw new Error(`Failed to update order status: ${updateError.message}`);
    }
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});