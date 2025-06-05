
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createHmac } from 'https://deno.land/std@0.177.0/crypto/mod.ts'

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
    // Use the test secret provided by the user
    const razorpayKeySecret = 'dQ8wWKtlLk9LPCdmutAV6HJ'

    const { razorpay_payment_id, razorpay_order_id, razorpay_signature }: VerificationData = await req.json()

    // Verify signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`
    
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
