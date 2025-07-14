
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AppliedCoupon {
  id: string;
  code: string;
  discount_amount: number;
  type: string;
  value: number;
}

interface CouponContextType {
  appliedCoupons: AppliedCoupon[];
  appliedCoupon: AppliedCoupon | null;
  addCoupon: (coupon: AppliedCoupon) => void;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: (couponId?: string) => void;
  clearCoupons: () => void;
  getTotalDiscount: () => number;
}

const CouponContext = createContext<CouponContextType | undefined>(undefined);

export const useCoupon = () => {
  const context = useContext(CouponContext);
  if (!context) {
    throw new Error('useCoupon must be used within a CouponProvider');
  }
  return context;
};

export const useCouponState = () => {
  const context = useContext(CouponContext);
  if (!context) {
    throw new Error('useCouponState must be used within a CouponProvider');
  }
  return context;
};

interface CouponProviderProps {
  children: ReactNode;
}

export const CouponProvider: React.FC<CouponProviderProps> = ({ children }) => {
  const [appliedCoupons, setAppliedCoupons] = useState<AppliedCoupon[]>([]);

  const addCoupon = (coupon: AppliedCoupon) => {
    setAppliedCoupons(prev => [...prev.filter(c => c.id !== coupon.id), coupon]);
  };

  const applyCoupon = async (code: string) => {
    // Mock implementation for now
    console.log('Applying coupon:', code);
  };

  const removeCoupon = (couponId?: string) => {
    if (couponId) {
      setAppliedCoupons(prev => prev.filter(c => c.id !== couponId));
    } else {
      setAppliedCoupons([]);
    }
  };

  const clearCoupons = () => {
    setAppliedCoupons([]);
  };

  const getTotalDiscount = () => {
    return appliedCoupons.reduce((total, coupon) => total + coupon.discount_amount, 0);
  };

  const appliedCoupon = appliedCoupons.length > 0 ? appliedCoupons[0] : null;

  return (
    <CouponContext.Provider value={{
      appliedCoupons,
      appliedCoupon,
      addCoupon,
      applyCoupon,
      removeCoupon,
      clearCoupons,
      getTotalDiscount
    }}>
      {children}
    </CouponContext.Provider>
  );
};

export const CouponStateProvider = CouponProvider;
