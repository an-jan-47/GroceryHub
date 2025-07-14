
import React, { useRef } from 'react';
import { generatePDF } from 'react-pdf';
import { Order, CartItem } from '@/types';

interface OrderInvoiceProps {
  order: Order;
  items: CartItem[];
  appliedCoupons?: any[];
  subtotal: number;
  platformFees: number;
  razorpayFees: number;
  discountAmount: number;
}

const OrderInvoice: React.FC<OrderInvoiceProps> = ({
  order,
  items,
  appliedCoupons = [],
  subtotal,
  platformFees,
  razorpayFees,
  discountAmount
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  const calculateItemTotal = (item: CartItem) => {
    const price = item.salePrice || item.price;
    return price * item.quantity;
  };

  const renderInvoiceContent = () => (
    <div className="bg-white p-8 max-w-4xl mx-auto">
      <div className="border-b pb-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Invoice</h1>
        <p className="text-gray-600">Order #{order.id}</p>
        <p className="text-gray-600">Date: {formatDate(order.order_date)}</p>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="font-semibold text-gray-800 mb-2">Bill To:</h2>
          <p className="text-gray-600">Customer</p>
        </div>
        <div>
          <h2 className="font-semibold text-gray-800 mb-2">Payment Method:</h2>
          <p className="text-gray-600">{order.payment_method}</p>
        </div>
      </div>

      <div className="mb-8">
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-left">Item</th>
              <th className="border border-gray-300 px-4 py-2 text-right">Qty</th>
              <th className="border border-gray-300 px-4 py-2 text-right">Price</th>
              <th className="border border-gray-300 px-4 py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item: CartItem, index: number) => (
              <tr key={index}>
                <td className="border border-gray-300 px-4 py-2">{item.name}</td>
                <td className="border border-gray-300 px-4 py-2 text-right">{item.quantity}</td>
                <td className="border border-gray-300 px-4 py-2 text-right">
                  {formatCurrency(item.salePrice || item.price)}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right">
                  {formatCurrency(calculateItemTotal(item))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <div className="w-64">
          <div className="flex justify-between py-2">
            <span>Subtotal:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between py-2 text-green-600">
              <span>Discount:</span>
              <span>-{formatCurrency(discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between py-2">
            <span>Platform Fees:</span>
            <span>{formatCurrency(platformFees)}</span>
          </div>
          <div className="flex justify-between py-2">
            <span>Payment Gateway Fees:</span>
            <span>{formatCurrency(razorpayFees)}</span>
          </div>
          <div className="flex justify-between py-2 font-bold text-lg border-t">
            <span>Total:</span>
            <span>{formatCurrency(order.total_amount)}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {renderInvoiceContent()}
    </div>
  );
};

export default OrderInvoice;
