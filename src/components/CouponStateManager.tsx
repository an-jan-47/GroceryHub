import { useState, useEffect } from 'react';
import { type Coupon } from '@/services/couponService';

// Global coupon state that persists across components
class CouponStateManager {
  private appliedCoupons: Array<{ coupon: Coupon; discountAmount: number }> = [];
  private listeners: Array<() => void> = [];

  getAppliedCoupons() {
    return [...this.appliedCoupons];
  }

  setCoupons(coupons: Array<{ coupon: Coupon; discountAmount: number }>) {
    this.appliedCoupons = coupons;
    this.notifyListeners();
  }

  addCoupon(coupon: Coupon, discountAmount: number) {
    // Check if coupon already exists
    const existingIndex = this.appliedCoupons.findIndex(c => c.coupon.id === coupon.id);
    if (existingIndex !== -1) {
      this.appliedCoupons[existingIndex] = { coupon, discountAmount };
    } else {
      this.appliedCoupons.push({ coupon, discountAmount });
    }
    this.notifyListeners();
  }

  removeCoupon(couponId: string) {
    this.appliedCoupons = this.appliedCoupons.filter(c => c.coupon.id !== couponId);
    this.notifyListeners();
  }

  clearCoupons() {
    this.appliedCoupons = [];
    this.notifyListeners();
  }

  getTotalDiscount(): number {
    return this.appliedCoupons.reduce((total, { discountAmount }) => total + discountAmount, 0);
  }

  isCouponApplied(couponId: string): boolean {
    return this.appliedCoupons.some(c => c.coupon.id === couponId);
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }
}

// Create a singleton instance
const couponStateManager = new CouponStateManager();

// Custom hook to use coupon state
export const useCouponState = () => {
  const [appliedCoupons, setAppliedCoupons] = useState<Array<{ coupon: Coupon; discountAmount: number }>>([]);

  useEffect(() => {
    // Initialize with current state
    setAppliedCoupons(couponStateManager.getAppliedCoupons());

    // Subscribe to changes
    const unsubscribe = couponStateManager.subscribe(() => {
      setAppliedCoupons(couponStateManager.getAppliedCoupons());
    });

    return unsubscribe;
  }, []);

  return {
    appliedCoupons,
    addCoupon: (coupon: Coupon, discountAmount: number) => 
      couponStateManager.addCoupon(coupon, discountAmount),
    removeCoupon: (couponId: string) => 
      couponStateManager.removeCoupon(couponId),
    clearCoupons: () => 
      couponStateManager.clearCoupons(),
    setCoupons: (coupons: Array<{ coupon: Coupon; discountAmount: number }>) => 
      couponStateManager.setCoupons(coupons),
    getTotalDiscount: () => 
      couponStateManager.getTotalDiscount(),
    isCouponApplied: (couponId: string) => 
      couponStateManager.isCouponApplied(couponId)
  };
};

export default couponStateManager;