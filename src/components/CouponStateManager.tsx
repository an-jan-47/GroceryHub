
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Coupon } from '@/services/couponService';

interface CouponData {
  coupon: Coupon;
  discountAmount: number;
  appliedToTotal?: number;
}

interface CouponStateContextType {
  appliedCoupons: CouponData[];
  setCoupons: (coupons: CouponData[]) => void;
  addCoupon: (coupon: Coupon, discountAmount: number) => void;
  removeCoupon: (couponId: string) => void;
  clearCoupons: () => void;
}

const CouponStateContext = createContext<CouponStateContextType | undefined>(undefined);

export function CouponStateProvider({ children }: { children: ReactNode }) {
  const [appliedCoupons, setAppliedCoupons] = useState<CouponData[]>([]);

  const setCoupons = (coupons: CouponData[]) => {
    setAppliedCoupons(coupons);
  };

  const addCoupon = (coupon: Coupon, discountAmount: number) => {
    const couponData: CouponData = {
      coupon,
      discountAmount,
      appliedToTotal: discountAmount
    };
    setAppliedCoupons(prev => [...prev, couponData]);
  };

  const removeCoupon = (couponId: string) => {
    setAppliedCoupons(prev => prev.filter(item => item.coupon.id !== couponId));
  };

  const clearCoupons = () => {
    setAppliedCoupons([]);
  };

  return (
    <CouponStateContext.Provider value={{
      appliedCoupons,
      setCoupons,
      addCoupon,
      removeCoupon,
      clearCoupons
    }}>
      {children}
    </CouponStateContext.Provider>
  );
}

export function useCouponState() {
  const context = useContext(CouponStateContext);
  if (context === undefined) {
    throw new Error('useCouponState must be used within a CouponStateProvider');
  }
  return context;
}
