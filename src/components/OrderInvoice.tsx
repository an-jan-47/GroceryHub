
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
  }
});

interface OrderInvoiceProps {
  order: any;
  items: any[];
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
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.title}>Order Invoice</Text>
        <Text style={styles.text}>Order ID: {order.id}</Text>
        <Text style={styles.text}>Date: {new Date(order.order_date).toLocaleDateString()}</Text>
        <Text style={styles.text}>Status: {order.status}</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.text}>Items:</Text>
        {items.map((item, index) => (
          <Text key={index} style={styles.text}>
            {item.product?.name || 'Product'} - Qty: {item.quantity} - ₹{item.price}
          </Text>
        ))}
      </View>
      
      <View style={styles.section}>
        <Text style={styles.text}>Subtotal: ₹{subtotal.toFixed(2)}</Text>
        <Text style={styles.text}>Platform Fees: ₹{platformFees.toFixed(2)}</Text>
        {razorpayFees > 0 && (
          <Text style={styles.text}>Transaction Fee: ₹{razorpayFees.toFixed(2)}</Text>
        )}
        {discountAmount > 0 && (
          <Text style={styles.text}>Discount: -₹{discountAmount.toFixed(2)}</Text>
        )}
        <Text style={styles.text}>Total: ₹{(subtotal + platformFees + razorpayFees - discountAmount).toFixed(2)}</Text>
      </View>
    </Page>
  </Document>
);

export default OrderInvoice;
