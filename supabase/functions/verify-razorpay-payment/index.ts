
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

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
    // Get Razorpay secret from environment variables
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')

    if (!razorpayKeySecret) {
      console.error('Razorpay secret not found in environment variables')
      return new Response(JSON.stringify({ 
        verified: false, 
        error: 'Razorpay credentials not configured' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { razorpay_payment_id, razorpay_order_id, razorpay_signature }: VerificationData = await req.json()

    // Validate input
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return new Response(JSON.stringify({ 
        verified: false, 
        error: 'Missing required payment verification data' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Verify signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`
    
    console.log('Verifying payment signature for order:', razorpay_order_id, 'payment:', razorpay_payment_id)
    
    const encoder = new TextEncoder()
    const keyData = encoder.encode(razorpayKeySecret)
    const bodyData = encoder.encode(body)
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, bodyData)
    const expectedSignature = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    const isValid = expectedSignature === razorpay_signature
    
    console.log('Payment verification result:', isValid ? 'SUCCESS' : 'FAILED')

    if (!isValid) {
      return new Response(JSON.stringify({ 
        verified: false, 
        error: 'Invalid payment signature' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ 
      verified: true,
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error verifying payment:', error)
    return new Response(JSON.stringify({ 
      verified: false, 
      error: 'Internal server error',
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
