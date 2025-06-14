
import { useState, useEffect } from 'react';
import { type Coupon } from '@/services/couponService';

interface AppliedCouponState {
  coupon: Coupon;
  discountAmount: number;
}

interface CouponStateManager {
  appliedCoupons: AppliedCouponState[];
  addCoupon: (coupon: Coupon, discountAmount: number) => void;
  removeCoupon: (couponId: string) => void;
  clearCoupons: () => void;
}

// Create a simple global state for coupons
const globalCouponState = {
  appliedCoupons: [] as AppliedCouponState[],
  listeners: [] as Array<() => void>,
  
  addCoupon(coupon: Coupon, discountAmount: number) {
    const existingIndex = this.appliedCoupons.findIndex(c => c.coupon.id === coupon.id);
    if (existingIndex !== -1) {
      this.appliedCoupons[existingIndex] = { coupon, discountAmount };
    } else {
      this.appliedCoupons.push({ coupon, discountAmount });
    }
    this.notifyListeners();
  },
  
  removeCoupon(couponId: string) {
    this.appliedCoupons = this.appliedCoupons.filter(c => c.coupon.id !== couponId);
    this.notifyListeners();
  },
  
  clearCoupons() {
    this.appliedCoupons = [];
    this.notifyListeners();
  },
  
  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  },
  
  notifyListeners() {
    this.listeners.forEach(listener => listener());
  }
};

export const useCouponState = (): CouponStateManager => {
  const [appliedCoupons, setAppliedCoupons] = useState<AppliedCouponState[]>([]);
  
  useEffect(() => {
    const unsubscribe = globalCouponState.subscribe(() => {
      setAppliedCoupons([...globalCouponState.appliedCoupons]);
    });
    
    // Initialize with current state
    setAppliedCoupons([...globalCouponState.appliedCoupons]);
    
    return unsubscribe;
  }, []);
  
  return {
    appliedCoupons,
    addCoupon: globalCouponState.addCoupon.bind(globalCouponState),
    removeCoupon: globalCouponState.removeCoupon.bind(globalCouponState),
    clearCoupons: globalCouponState.clearCoupons.bind(globalCouponState),
  };
};
