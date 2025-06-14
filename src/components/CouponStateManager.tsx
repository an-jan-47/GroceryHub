
import { useState, useEffect } from 'react';

export interface AppliedCouponState {
  coupon: {
    id: string;
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    min_purchase_amount: number;
    max_discount_amount?: number;
  };
  discountAmount: number;
  appliedToTotal?: number;
}

class CouponStateManager {
  private appliedCoupons: AppliedCouponState[] = [];
  private listeners: ((coupons: AppliedCouponState[]) => void)[] = [];

  addCoupon(coupon: AppliedCouponState['coupon'], discountAmount: number) {
    // Check if coupon already exists
    const existingIndex = this.appliedCoupons.findIndex(c => c.coupon.id === coupon.id);
    
    if (existingIndex === -1) {
      const newCoupon: AppliedCouponState = { coupon, discountAmount };
      this.appliedCoupons = [...this.appliedCoupons, newCoupon];
      this.updateLocalStorage();
      this.notifyListeners();
    }
  }

  removeCoupon(couponId: string) {
    console.log('CouponStateManager: Removing coupon with ID:', couponId);
    const originalLength = this.appliedCoupons.length;
    this.appliedCoupons = this.appliedCoupons.filter(c => c.coupon.id !== couponId);
    
    if (this.appliedCoupons.length !== originalLength) {
      console.log('CouponStateManager: Coupon removed, new count:', this.appliedCoupons.length);
      this.updateLocalStorage();
      this.notifyListeners();
    }
  }

  clearCoupons() {
    if (this.appliedCoupons.length > 0) {
      this.appliedCoupons = [];
      this.updateLocalStorage();
      this.notifyListeners();
      console.log('CouponStateManager: All coupons cleared');
    }
  }

  setCoupons(coupons: AppliedCouponState[]) {
    this.appliedCoupons = [...coupons];
    this.updateLocalStorage();
    this.notifyListeners();
  }

  getAppliedCoupons(): AppliedCouponState[] {
    return [...this.appliedCoupons];
  }

  subscribe(listener: (coupons: AppliedCouponState[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    // Use setTimeout to prevent infinite loops
    setTimeout(() => {
      this.listeners.forEach(listener => {
        try {
          listener([...this.appliedCoupons]);
        } catch (error) {
          console.error('Error in coupon state listener:', error);
        }
      });
    }, 0);
  }

  private updateLocalStorage() {
    try {
      if (this.appliedCoupons.length > 0) {
        localStorage.setItem('appliedCoupon', JSON.stringify(this.appliedCoupons));
      } else {
        localStorage.removeItem('appliedCoupon');
      }
    } catch (error) {
      console.error('Error updating localStorage:', error);
    }
  }

  // Add method to check if cart is empty and clear coupons
  checkCartAndClearCoupons(cartItemsLength: number) {
    if (cartItemsLength === 0 && this.appliedCoupons.length > 0) {
      console.log('Cart is empty, clearing all coupons');
      this.clearCoupons();
    }
  }
}

const couponStateManager = new CouponStateManager();

export const useCouponState = () => {
  const [appliedCoupons, setAppliedCoupons] = useState<AppliedCouponState[]>(
    couponStateManager.getAppliedCoupons()
  );

  useEffect(() => {
    const unsubscribe = couponStateManager.subscribe((coupons) => {
      setAppliedCoupons(coupons);
    });

    return unsubscribe;
  }, []);

  return {
    appliedCoupons,
    addCoupon: (coupon: AppliedCouponState['coupon'], discountAmount: number) => 
      couponStateManager.addCoupon(coupon, discountAmount),
    removeCoupon: (couponId: string) => couponStateManager.removeCoupon(couponId),
    clearCoupons: () => couponStateManager.clearCoupons(),
    setCoupons: (coupons: AppliedCouponState[]) => couponStateManager.setCoupons(coupons),
    checkCartAndClearCoupons: (cartItemsLength: number) => 
      couponStateManager.checkCartAndClearCoupons(cartItemsLength)
  };
};
