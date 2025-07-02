import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

import type { Coupon } from '@/services/couponService';

export interface AppliedCouponState {
  coupon: Coupon;
  discountAmount: number;
  appliedToTotal?: number;
}

interface CouponStateContextType {
  appliedCoupons: AppliedCouponState[];
  addCoupon: (coupon: Coupon, discountAmount: number) => void;
  removeCoupon: (couponId: string) => void;
  clearCoupons: () => void;
  setCoupons: (coupons: AppliedCouponState[]) => void;
  checkCartAndClearCoupons: (cartLength: number) => void;
}

const CouponStateContext = createContext<CouponStateContextType | undefined>(undefined);

export const CouponStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [appliedCoupons, setAppliedCoupons] = useState<AppliedCouponState[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load coupons only once on mount
  useEffect(() => {
    const storedCouponData = localStorage.getItem('appliedCoupon');
    if (storedCouponData) {
      try {
        const parsedData = JSON.parse(storedCouponData);
        let couponsToLoad: AppliedCouponState[] = [];
        if (Array.isArray(parsedData)) {
          couponsToLoad = parsedData;
        } else if (parsedData.coupon) {
          couponsToLoad = [parsedData];
        }
        setAppliedCoupons(couponsToLoad);
      } catch (error) {
        localStorage.removeItem('appliedCoupon');
      }
    }
    setIsInitialized(true);
  }, []);

  // Save coupons to localStorage with debounce
  useEffect(() => {
    if (!isInitialized) return;

    const timeoutId = setTimeout(() => {
      if (appliedCoupons.length > 0) {
        localStorage.setItem('appliedCoupon', JSON.stringify(appliedCoupons));
      } else {
        localStorage.removeItem('appliedCoupon');
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [appliedCoupons, isInitialized]);

  const addCoupon = (coupon: Coupon, discountAmount: number) => {
    setAppliedCoupons(prevCoupons => {
      // Check for existing coupon to prevent duplicates
      const existingCoupon = prevCoupons.find(c => c.coupon.id === coupon.id);
      if (existingCoupon) return prevCoupons;
      return [...prevCoupons, { coupon, discountAmount }];
    });
  };

  const removeCoupon = (couponId: string) => {
    setAppliedCoupons(prevCoupons => {
      const updatedCoupons = prevCoupons.filter(c => c.coupon.id !== couponId);
      // Force immediate localStorage update
      if (updatedCoupons.length > 0) {
        localStorage.setItem('appliedCoupon', JSON.stringify(updatedCoupons));
      } else {
        localStorage.removeItem('appliedCoupon');
      }
      return updatedCoupons;
    });
  };

  const clearCoupons = () => {
    setAppliedCoupons([]);
    // Force immediate localStorage removal
    localStorage.removeItem('appliedCoupon');
  };

  const setCoupons = (coupons: AppliedCouponState[]) => {
    setAppliedCoupons(coupons);
  };

  const checkCartAndClearCoupons = (cartLength: number) => {
    if (cartLength === 0 && appliedCoupons.length > 0) {
      clearCoupons();
    }
  };

  return (
    <CouponStateContext.Provider 
      value={{ 
        appliedCoupons,
        addCoupon,
        removeCoupon,
        clearCoupons,
        setCoupons,
        checkCartAndClearCoupons
      }}>
      {children}
    </CouponStateContext.Provider>
  );
};

export const useCouponState = () => {
  const context = useContext(CouponStateContext);
  if (!context) {
    throw new Error('useCouponState must be used within a CouponStateProvider');
  }
  return context;
};
