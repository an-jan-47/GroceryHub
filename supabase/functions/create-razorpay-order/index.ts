
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OrderData {
  amount: number
  currency: string
  receipt: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Use the test credentials provided by the user
    const razorpayKeyId = 'rzp_test_NhYbBXqUSxpojf'
    const razorpayKeySecret = 'dQ8wWKtlLk9LPCdmutAV6HJ'

    const { amount, currency = 'INR', receipt }: OrderData = await req.json()

    // Create order with Razorpay
    const auth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`)
    
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount, // Amount already in paise
        currency,
        receipt,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Razorpay API error:', errorText)
      throw new Error('Failed to create Razorpay order')
    }

    const order = await response.json()

    return new Response(JSON.stringify(order), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error creating Razorpay order:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
