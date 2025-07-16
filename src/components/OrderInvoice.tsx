import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Image } from '@react-pdf/renderer';
import { formatCurrency } from '@/utils/formatters';

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: 'Helvetica',
    fontSize: 10,
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
    paddingBottom: 15,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4285F4',
    marginBottom: 5,
  },
  companyInfo: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 3,
  },
  mainContent: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  leftColumn: {
    width: '50%',
    paddingRight: 10,
  },
  rightColumn: {
    width: '50%',
    paddingLeft: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333333',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    width: '40%',
    color: '#333333',
  },
  detailValue: {
    fontSize: 10,
    width: '60%',
    color: '#666666',
  },
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  tableRow: {
    flexDirection: 'row',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
    paddingVertical: 6,
    paddingHorizontal: 5,
    minHeight: 25,
  },
  tableCell: {
    fontSize: 9,
    textAlign: 'left',
    paddingHorizontal: 3,
  },
  tableCellCenter: {
    textAlign: 'center',
  },
  tableCellRight: {
    textAlign: 'right',
  },
  col1: { width: '25%' }, // Product
  col2: { width: '12%' }, // HSN
  col3: { width: '8%' },  // Qty
  col4: { width: '12%' }, // Rate
  col5: { width: '12%' }, // Item Discount
  col6: { width: '15%' }, // GST (18%)
  col7: { width: '16%' }, // Amount
  summarySection: {
    marginTop: 20,
    flexDirection: 'row',
  },
  summaryLeft: {
    width: '60%',
  },
  summaryRight: {
    width: '40%',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    paddingHorizontal: 10,
  },
  summaryLabel: {
    fontSize: 10,
    color: '#333333',
  },
  summaryValue: {
    fontSize: 10,
    color: '#333333',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: '#000000',
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
  },
  totalValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
  },
  footer: {
    marginTop: 30,
    textAlign: 'center',
    fontSize: 9,
    color: '#666666',
  },
  footerNote: {
    marginTop: 15,
    fontSize: 8,
    color: '#999999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  bold: {
    fontWeight: 'bold',
  },
  discountText: {
    color: '#00AA00',
  },
});

const OrderInvoice = ({ order, items, appliedCoupons, subtotal, platformFees, razorpayFees, discountAmount }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const paymentMethod = order.payment_method === 'cod' ? 'COD' : 
    order.payment_method === 'razorpay' ? 'RAZORPAY' : 
    order.payment_method.toUpperCase();

  // GST calculation (18%) - for breakdown only, not added to totals
  const gstRate = 0.18;
  const calculateGSTBreakdown = (amount) => {
    // GST is already included in the price, so we calculate what portion is GST
    return (amount * gstRate) / (1 + gstRate);
  };
  
  // Calculate GST breakdown for display purposes only
  const itemsWithGSTBreakdown = items.map(item => {
    const itemTotal = item.price * item.quantity;
    const gstAmount = calculateGSTBreakdown(itemTotal);
    return {
      ...item,
      itemTotal,
      gstAmount
    };
  });

  const finalTotal = subtotal + platformFees + razorpayFees - discountAmount;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.companyName}>GroceryHub</Text>
          <Text style={styles.companyInfo}>Email: groceryhub153@gmail.com | Phone: 7352402688</Text>
        </View>

        {/* Invoice Details and Billing Address */}
        <View style={styles.mainContent}>
          <View style={styles.leftColumn}>
            <Text style={styles.sectionTitle}>Invoice Details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Invoice ID:</Text>
              <Text style={styles.detailValue}>{order.id}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date:</Text>
              <Text style={styles.detailValue}>{formatDate(order.order_date)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Payment Method:</Text>
              <Text style={styles.detailValue}>{paymentMethod}</Text>
            </View>
          </View>

          <View style={styles.rightColumn}>
            <Text style={styles.sectionTitle}>Billing Address</Text>
            {order.address && (
              <View>
                <Text style={styles.detailValue}>{order.address.name}</Text>
                <Text style={styles.detailValue}>{order.address.address}</Text>
                <Text style={styles.detailValue}>{order.address.city}, {order.address.state} - {order.address.pincode}</Text>
                <Text style={styles.detailValue}>Phone: {order.address.phone}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, styles.col1, styles.bold]}>Product</Text>
            <Text style={[styles.tableCell, styles.col2, styles.bold, styles.tableCellCenter]}>HSN</Text>
            <Text style={[styles.tableCell, styles.col3, styles.bold, styles.tableCellCenter]}>Qty</Text>
            <Text style={[styles.tableCell, styles.col4, styles.bold, styles.tableCellRight]}>Rate</Text>
            <Text style={[styles.tableCell, styles.col5, styles.bold, styles.tableCellCenter]}>Item Discount</Text>
            <Text style={[styles.tableCell, styles.col6, styles.bold, styles.tableCellRight]}>GST</Text>
            <Text style={[styles.tableCell, styles.col7, styles.bold, styles.tableCellRight]}>Amount</Text>
          </View>

          {/* Table Rows */}
          {itemsWithGSTBreakdown.map((item, index) => (
            <View key={item.id || index} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.col1]}>
                {item.product ? item.product.name : `Product ${item.product_id ? item.product_id.substring(0, 8) : 'Unknown'}`}
              </Text>
              <Text style={[styles.tableCell, styles.col2, styles.tableCellCenter]}>
                {item.hsn_code || '18069020'}
              </Text>
              <Text style={[styles.tableCell, styles.col3, styles.tableCellCenter]}>
                {item.quantity}
              </Text>
              <Text style={[styles.tableCell, styles.col4, styles.tableCellRight]}>
                Rs.{item.price}
              </Text>
              <Text style={[styles.tableCell, styles.col5, styles.tableCellCenter]}>
                -
              </Text>
              <Text style={[styles.tableCell, styles.col6, styles.tableCellRight]}>
                Rs.{Math.round(item.gstAmount)}
                {'\n'}
                <Text style={{fontSize: 8, color: '#666666'}}>(18%)</Text>
              </Text>
              <Text style={[styles.tableCell, styles.col7, styles.tableCellRight]}>
                Rs.{item.itemTotal}
              </Text>
            </View>
          ))}
        </View>

        {/* Summary Section */}
        <View style={styles.summarySection}>
          <View style={styles.summaryLeft}>
            {/* Left side can contain additional notes */}
          </View>
          
          <View style={styles.summaryRight}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal:</Text>
              <Text style={styles.summaryValue}>Rs.{subtotal.toFixed(2)}</Text>
            </View>
            
            {appliedCoupons && appliedCoupons.length > 0 && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, styles.discountText]}>Coupon Discount:</Text>
                <Text style={[styles.summaryValue, styles.discountText]}>-Rs.{discountAmount.toFixed(2)}</Text>
              </View>
            )}
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Platform Fee:</Text>
              <Text style={styles.summaryValue}>Rs.{platformFees.toFixed(2)}</Text>
            </View>
            
            {razorpayFees > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Transaction Fee (2%):</Text>
                <Text style={styles.summaryValue}>Rs.{razorpayFees.toFixed(2)}</Text>
              </View>
            )}
            
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount:</Text>
              <Text style={styles.totalValue}>Rs.{finalTotal.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Amrita traders is marketed as GroceryHub.</Text>
          <Text>Note: GST breakdown is for informational purposes only and is already included in the product price.</Text>
          
          <View style={styles.footerNote}>
            <Text>Thank you for shopping with GroceryHub!</Text>
            <Text>This is a computer generated invoice and does not require signature.</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default OrderInvoice;
