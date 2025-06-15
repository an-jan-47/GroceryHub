
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

  // Load coupons from localStorage on mount
  useEffect(() => {
    const storedCouponData = localStorage.getItem('appliedCoupon');
    if (storedCouponData) {
      try {
        const parsedData = JSON.parse(storedCouponData);
        console.log('CouponStateManager: Loading coupons from localStorage:', parsedData);
        
        let couponsToLoad: AppliedCouponState[] = [];
        if (Array.isArray(parsedData)) {
          couponsToLoad = parsedData;
        } else if (parsedData.coupon) {
          couponsToLoad = [parsedData];
        }
        
        setAppliedCoupons(couponsToLoad);
      } catch (error) {
        console.error('CouponStateManager: Error loading coupons from localStorage:', error);
        localStorage.removeItem('appliedCoupon');
      }
    }
  }, []);

  // Save coupons to localStorage whenever they change
  useEffect(() => {
    if (appliedCoupons.length > 0) {
      console.log('CouponStateManager: Saving coupons to localStorage:', appliedCoupons);
      localStorage.setItem('appliedCoupon', JSON.stringify(appliedCoupons));
    } else {
      localStorage.removeItem('appliedCoupon');
    }
  }, [appliedCoupons]);

  const addCoupon = (coupon: Coupon, discountAmount: number) => {
    console.log('CouponStateManager: Adding coupon:', coupon.code, 'discount:', discountAmount);
    setAppliedCoupons(prevCoupons => {
      // Check if coupon is already applied
      const existingIndex = prevCoupons.findIndex(c => c.coupon.id === coupon.id);
      if (existingIndex !== -1) {
        console.log('CouponStateManager: Coupon already applied, updating:', coupon.code);
        // Update existing coupon
        const updatedCoupons = [...prevCoupons];
        updatedCoupons[existingIndex] = { coupon, discountAmount };
        return updatedCoupons;
      } else {
        // Add new coupon
        const newCoupons = [...prevCoupons, { coupon, discountAmount }];
        console.log('CouponStateManager: Added new coupon, total coupons:', newCoupons.length);
        return newCoupons;
      }
    });
  };

  const removeCoupon = (couponId: string) => {
    console.log('CouponStateManager: Removing coupon with ID:', couponId);
    setAppliedCoupons(prevCoupons => {
      const updatedCoupons = prevCoupons.filter(c => c.coupon.id !== couponId);
      console.log('CouponStateManager: Coupons after removal:', updatedCoupons.length);
      return updatedCoupons;
    });
  };

  const clearCoupons = () => {
    console.log('CouponStateManager: Clearing all coupons');
    setAppliedCoupons([]);
    localStorage.removeItem('appliedCoupon');
  };

  const setCoupons = (coupons: AppliedCouponState[]) => {
    console.log('CouponStateManager: Setting coupons:', coupons);
    setAppliedCoupons(coupons);
  };

  const checkCartAndClearCoupons = (cartLength: number) => {
    if (cartLength === 0 && appliedCoupons.length > 0) {
      console.log('CouponStateManager: Cart is empty, clearing coupons');
      clearCoupons();
    }
  };

  const value = {
    appliedCoupons,
    addCoupon,
    removeCoupon,
    clearCoupons,
    setCoupons,
    checkCartAndClearCoupons
  };

  return <CouponStateContext.Provider value={value}>{children}</CouponStateContext.Provider>;
};

export const useCouponState = () => {
  const context = useContext(CouponStateContext);
  if (!context) {
    throw new Error('useCouponState must be used within a CouponStateProvider');
  }
  return context;
};
