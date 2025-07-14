
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
  addCoupon: (coupon: AppliedCoupon) => void;
  removeCoupon: (couponId: string) => void;
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

interface CouponProviderProps {
  children: ReactNode;
}

export const CouponProvider: React.FC<CouponProviderProps> = ({ children }) => {
  const [appliedCoupons, setAppliedCoupons] = useState<AppliedCoupon[]>([]);

  const addCoupon = (coupon: AppliedCoupon) => {
    setAppliedCoupons(prev => [...prev.filter(c => c.id !== coupon.id), coupon]);
  };

  const removeCoupon = (couponId: string) => {
    setAppliedCoupons(prev => prev.filter(c => c.id !== couponId));
  };

  const clearCoupons = () => {
    setAppliedCoupons([]);
  };

  const getTotalDiscount = () => {
    return appliedCoupons.reduce((total, coupon) => total + coupon.discount_amount, 0);
  };

  return (
    <CouponContext.Provider value={{
      appliedCoupons,
      addCoupon,
      removeCoupon,
      clearCoupons,
      getTotalDiscount
    }}>
      {children}
    </CouponContext.Provider>
  );
};
