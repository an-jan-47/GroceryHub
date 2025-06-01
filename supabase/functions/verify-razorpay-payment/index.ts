
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { hmac } from 'https://deno.land/std@0.177.0/crypto/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface VerificationData {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')

    if (!razorpayKeySecret) {
      throw new Error('Razorpay key secret not configured')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!

    const { razorpay_payment_id, razorpay_order_id, razorpay_signature }: VerificationData = await req.json()

    // Verify signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`
    const expectedSignature = await hmac('sha256', razorpayKeySecret, body, 'utf8', 'hex')

    if (expectedSignature !== razorpay_signature) {
      return new Response(JSON.stringify({ verified: false, error: 'Invalid signature' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ verified: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error verifying payment:', error)
    return new Response(JSON.stringify({ verified: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
