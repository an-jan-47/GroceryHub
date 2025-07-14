
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AppliedCoupon } from '@/services/couponService';

interface CouponContextType {
  appliedCoupons: AppliedCoupon[];
  addCoupon: (coupon: AppliedCoupon) => void;
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
    setAppliedCoupons(prev => [...prev.filter(c => c.coupon.id !== coupon.coupon.id), coupon]);
  };

  const removeCoupon = (couponId?: string) => {
    if (couponId) {
      setAppliedCoupons(prev => prev.filter(c => c.coupon.id !== couponId));
    } else {
      setAppliedCoupons([]);
    }
  };

  const clearCoupons = () => {
    setAppliedCoupons([]);
  };

  const getTotalDiscount = () => {
    return appliedCoupons.reduce((total, coupon) => total + coupon.discountAmount, 0);
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

export const CouponStateProvider = CouponProvider;
