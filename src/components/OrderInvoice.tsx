
import React, { forwardRef } from "react";
import { formatCurrency } from "@/utils/formatCurrency"

interface OrderInvoiceProps {
  order: any;
  items: any[];
  appliedCoupons: any[];
  subtotal: number;
  platformFees: number;
  razorpayFees: number;
  discountAmount: number;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

const formatAmount = (amount: number) => {
  return formatCurrency(amount);
};

const renderItem = (item: any) => {
  return (
    <div key={item.id} className="flex justify-between items-center py-2">
      <div>
        <h4 className="font-medium">{item.name}</h4>
        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
      </div>
      <p className="font-medium">{formatAmount(item.price * item.quantity)}</p>
    </div>
  );
};

const renderItemRow = (item: any, index: number) => {
  return (
    <tr key={index}>
      <td className="px-4 py-2">{item.name}</td>
      <td className="px-4 py-2">{item.quantity}</td>
      <td className="px-4 py-2">{formatAmount(item.price)}</td>
      <td className="px-4 py-2">{formatAmount(item.price * item.quantity)}</td>
    </tr>
  );
};

export function OrderInvoice({ 
  order, 
  items, 
  appliedCoupons, 
  subtotal, 
  platformFees, 
  razorpayFees, 
  discountAmount 
}: OrderInvoiceProps) {
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg">
      <div className="border-b pb-4 mb-4">
        <h1 className="text-2xl font-bold">Order Invoice</h1>
        <p className="text-gray-600">Order ID: {order.id}</p>
        <p className="text-gray-600">Date: {formatDate(order.created_at)}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Items</h2>
        <div className="space-y-2">
          {items.map(renderItem)}
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatAmount(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Platform Fees:</span>
            <span>{formatAmount(platformFees)}</span>
          </div>
          <div className="flex justify-between">
            <span>Payment Fees:</span>
            <span>{formatAmount(razorpayFees)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount:</span>
              <span>-{formatAmount(discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Total:</span>
            <span>{formatAmount(subtotal + platformFees + razorpayFees - discountAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
