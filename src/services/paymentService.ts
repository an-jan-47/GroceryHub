
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
    // Call your backend function to create a Razorpay order
    const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
      body: { 
        amount: Math.round(amount * 100), // Convert to paise
        currency: 'INR',
        receipt 
      }
    });

    if (error) throw error;
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
      onSuccess(response);
    },
  });

  // Open Razorpay payment form
  razorpay.on('payment.failed', onError);
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
    const { data, error } = await supabase.functions.invoke('verify-razorpay-payment', {
      body: {
        razorpay_payment_id: paymentId,
        razorpay_order_id: razorpayOrderId,
        razorpay_signature: signature
      }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};

// Save payment details to database
export const savePaymentDetails = async (
  orderId: string,
  paymentId: string,
  amount: number,
  status: string,
  paymentMethod: string
) => {
  try {
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

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving payment details:', error);
    throw error;
  }
};
