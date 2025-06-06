
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
    // Get Razorpay credentials from environment variables
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID')
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error('Razorpay credentials not found in environment variables')
      return new Response(JSON.stringify({ 
        error: 'Razorpay credentials not configured. Please contact support.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { amount, currency = 'INR', receipt }: OrderData = await req.json()

    // Validate amount
    if (!amount || amount <= 0) {
      return new Response(JSON.stringify({ 
        error: 'Invalid amount provided' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create order with Razorpay
    const auth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`)
    
    console.log('Creating Razorpay order with amount:', amount, 'currency:', currency, 'receipt:', receipt)
    
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
      
      let errorMessage = 'Failed to create Razorpay order'
      try {
        const errorData = JSON.parse(errorText)
        if (errorData.error && errorData.error.description) {
          errorMessage = errorData.error.description
        }
      } catch (e) {
        // If we can't parse the error, use the default message
      }
      
      return new Response(JSON.stringify({ 
        error: errorMessage,
        details: errorText 
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const order = await response.json()
    console.log('Razorpay order created successfully:', order.id)
    
    // Add the key ID to the response so frontend can use it
    order.key_id = razorpayKeyId

    return new Response(JSON.stringify(order), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error creating Razorpay order:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
