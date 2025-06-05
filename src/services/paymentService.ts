
import { supabase } from "@/integrations/supabase/client";
import { toast } from '@/components/ui/sonner';

// Razorpay types
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes: {
    address: string;
  };
  theme: {
    color: string;
  };
  handler: (response: RazorpayResponse) => void;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

// Create a Razorpay order on the server
export const createRazorpayOrder = async (amount: number, receipt: string) => {
  try {
    console.log('Creating Razorpay order for amount:', amount, 'receipt:', receipt);
    
    // Call your backend function to create a Razorpay order
    const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
      body: { 
        amount: Math.round(amount * 100), // Convert to paise
        currency: 'INR',
        receipt 
      }
    });

    if (error) {
      console.error('Supabase function error:', error);
      
      // Provide more specific error messages
      if (error.message?.includes('credentials not configured')) {
        throw new Error('Payment gateway not configured. Please contact support.');
      } else if (error.message?.includes('Authentication failed')) {
        throw new Error('Payment gateway authentication failed. Please contact support.');
      } else {
        throw new Error(`Failed to create order: ${error.message}`);
      }
    }
    
    if (!data || data.error) {
      console.error('Razorpay order creation failed:', data);
      throw new Error(data?.error || 'Failed to create payment order');
    }
    
    console.log('Razorpay order created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
};

// Process payment with Razorpay
export const processRazorpayPayment = (
  options: Omit<RazorpayOptions, 'handler'>,
  onSuccess: (response: RazorpayResponse) => void,
  onError: (error: any) => void
) => {
  // Check if Razorpay is loaded
  if (!(window as any).Razorpay) {
    toast('Razorpay SDK failed to load', {
      description: 'Please check your internet connection and try again'
    });
    onError(new Error('Razorpay SDK failed to load'));
    return;
  }

  // Create Razorpay instance with options
  const razorpay = new (window as any).Razorpay({
    ...options,
    handler: (response: RazorpayResponse) => {
      console.log('Payment successful:', response);
      onSuccess(response);
    },
  });

  // Open Razorpay payment form
  razorpay.on('payment.failed', (response: any) => {
    console.error('Payment failed:', response.error);
    onError(response.error);
  });
  
  razorpay.open();
};

// Verify payment with your backend
export const verifyRazorpayPayment = async (
  paymentId: string,
  orderId: string,
  signature: string,
  razorpayOrderId: string
) => {
  try {
    console.log('Verifying payment:', { paymentId, orderId, signature, razorpayOrderId });
    
    const { data, error } = await supabase.functions.invoke('verify-razorpay-payment', {
      body: {
        razorpay_payment_id: paymentId,
        razorpay_order_id: razorpayOrderId,
        razorpay_signature: signature
      }
    });

    if (error) {
      console.error('Payment verification error:', error);
      throw new Error(`Verification failed: ${error.message}`);
    }
    
    if (!data || !data.verified) {
      console.error('Payment verification failed:', data);
      throw new Error(data?.error || 'Payment verification failed');
    }
    
    console.log('Payment verification result:', data);
    return data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};

// Save payment details to database using existing table structure
export const savePaymentDetails = async (
  orderId: string,
  paymentId: string,
  amount: number,
  status: string,
  paymentMethod: string
) => {
  try {
    console.log('Saving payment details:', { orderId, paymentId, amount, status, paymentMethod });
    
    const { data, error } = await supabase
      .from('payments')
      .insert({
        order_id: orderId,
        payment_id: paymentId,
        amount,
        currency: 'INR',
        status,
        payment_method: paymentMethod
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving payment details:', error);
      throw error;
    }
    
    console.log('Payment details saved successfully:', data);
    return data;
  } catch (error) {
    console.error('Error saving payment details:', error);
    throw error;
  }
};
