
import { useState, useEffect } from 'react';
import { type Coupon } from '@/services/couponService';

export interface AppliedCouponState {
  coupon: Coupon;
  discountAmount: number;
  appliedToTotal?: number; // Make this optional to match AppliedCoupon interface
}

interface CouponStateManager {
  appliedCoupons: AppliedCouponState[];
  addCoupon: (coupon: Coupon, discountAmount: number) => void;
  removeCoupon: (couponId: string) => void;
  clearCoupons: () => void;
  setCoupons: (coupons: AppliedCouponState[]) => void;
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
    this.saveToLocalStorage();
    this.notifyListeners();
  },
  
  removeCoupon(couponId: string) {
    console.log('Removing coupon with ID:', couponId, 'Current coupons:', this.appliedCoupons);
    this.appliedCoupons = this.appliedCoupons.filter(c => c.coupon.id !== couponId);
    console.log('After removal:', this.appliedCoupons);
    this.saveToLocalStorage();
    this.notifyListeners();
  },
  
  clearCoupons() {
    this.appliedCoupons = [];
    this.saveToLocalStorage();
    this.notifyListeners();
  },
  
  setCoupons(coupons: AppliedCouponState[]) {
    this.appliedCoupons = coupons;
    this.saveToLocalStorage();
    this.notifyListeners();
  },
  
  saveToLocalStorage() {
    if (this.appliedCoupons.length > 0) {
      localStorage.setItem('appliedCoupon', JSON.stringify(this.appliedCoupons));
    } else {
      localStorage.removeItem('appliedCoupon');
    }
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
    setCoupons: globalCouponState.setCoupons.bind(globalCouponState),
  };
};
