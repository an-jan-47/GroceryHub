
export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  min_purchase_amount: number;
  max_discount_amount?: number;
  description?: string;
  is_active: boolean;
  expiry_date: string;
}

export function calculateDiscount(coupon: Coupon, cartTotal: number): number {
  if (cartTotal < coupon.min_purchase_amount) {
    return 0;
  }

  let discount = 0;
  if (coupon.type === 'percentage') {
    discount = (cartTotal * coupon.value) / 100;
  } else {
    discount = coupon.value;
  }

  if (coupon.max_discount_amount && discount > coupon.max_discount_amount) {
    discount = coupon.max_discount_amount;
  }

  return discount;
}

export async function validateCoupon(
  code: string, 
  cartTotal: number, 
  appliedCoupons: any[] = []
): Promise<Coupon> {
  // Mock validation - replace with actual API call
  const mockCoupon: Coupon = {
    id: '1',
    code: code,
    type: 'percentage' as const,
    value: 10,
    min_purchase_amount: 100,
    description: 'Get 10% off on orders above ₹100',
    is_active: true,
    expiry_date: '2024-12-31'
  };
  
  if (cartTotal >= mockCoupon.min_purchase_amount) {
    return mockCoupon;
  }
  
  throw new Error('Coupon not valid for this cart total');
}

export async function getActiveCoupons(limit: number = 10): Promise<Coupon[]> {
  // Mock data - replace with actual API call
  return [
    {
      id: '1',
      code: 'SAVE10',
      type: 'percentage' as const,
      value: 10,
      min_purchase_amount: 100,
      description: 'Get 10% off on orders above ₹100',
      is_active: true,
      expiry_date: '2024-12-31'
    },
    {
      id: '2',
      code: 'FLAT50',
      type: 'fixed' as const,
      value: 50,
      min_purchase_amount: 200,
      description: 'Get ₹50 off on orders above ₹200',
      is_active: true,
      expiry_date: '2024-12-31'
    }
  ].slice(0, limit);
}

export async function getCouponById(id: string): Promise<Coupon | null> {
  const coupons = await getActiveCoupons();
  return coupons.find(coupon => coupon.id === id) || null;
}

export function formatCouponForDisplay(coupon: Coupon) {
  const formattedDiscount = coupon.type === 'percentage' 
    ? `${coupon.value}% OFF` 
    : `₹${coupon.value} OFF`;
  
  const formattedMinPurchase = coupon.min_purchase_amount > 0 
    ? `Min purchase: ₹${coupon.min_purchase_amount}` 
    : '';
  
  return {
    formattedDiscount,
    formattedMinPurchase
  };
}
