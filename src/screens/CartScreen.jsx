import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import CartItemRow from '../components/CartItemRow';

export default function CartScreen({ navigation }) {
  const {
    getCartItems,
    addItem,
    removeItem,
    deleteItem,
    getSubtotal,
    getTax,
    getDeliveryFee,
    getTotal,
  } = useCart();

  const [promoCode, setPromoCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const cartItems = getCartItems();
  const subtotal = getSubtotal();
  const tax = getTax();
  const deliveryFee = getDeliveryFee();
  const baseTotal = getTotal();
  const finalTotal = Math.max(0, baseTotal - discountAmount);

  const handleApplyCoupon = () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) {
      Alert.alert('Coupon Error', 'Please enter a valid promo code.');
      return;
    }

    if (code === 'WELCOME10') {
      const disc = subtotal * 0.1;
      setDiscountAmount(disc);
      setAppliedCoupon('WELCOME10 (10% OFF)');
      Alert.alert('🎉 Promo Applied!', 'You received 10% OFF your order!');
    } else if (code === 'SIP20') {
      setDiscountAmount(20);
      setAppliedCoupon('SIP20 (₹20 OFF)');
      Alert.alert('🎉 Promo Applied!', 'You received ₹20 OFF your order!');
    } else if (code === 'SIPBITE') {
      const disc = subtotal * 0.15;
      setDiscountAmount(disc);
      setAppliedCoupon('SIPBITE (15% OFF)');
      Alert.alert('🎉 Promo Applied!', 'Special 15% discount applied!');
    } else {
      Alert.alert('Invalid Promo Code', 'Try "WELCOME10", "SIP20", or "SIPBITE".');
    }
  };

  const handleRemoveCoupon = () => {
    setDiscountAmount(0);
    setAppliedCoupon(null);
    setPromoCode('');
  };

  const handleProceed = () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Add items before proceeding to checkout.');
      return;
    }
    navigation.navigate('Checkout', { discountAmount, appliedCoupon });
  };

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color="#1F1610" />
        </Pressable>
        <Text style={styles.headerTitle}>Shopping Cart ({cartItems.length})</Text>
        <View style={{ width: 32 }} />
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="cart-outline" size={54} color="#FF3D00" style={{ marginBottom: 12 }} />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>Explore our delicious coffee, shakes & bites!</Text>
          <Pressable style={styles.browseButton} onPress={() => navigation.goBack()}>
            <Text style={styles.browseButtonText}>Explore Menu</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Cart Items List */}
            {cartItems.map((item) => (
              <CartItemRow
                key={item.menuItem.id}
                cartItem={item}
                item={item}
                onIncrease={() => addItem(item.menuItem)}
                onDecrease={() => removeItem(item.menuItem.id)}
                onDelete={() => deleteItem(item.menuItem.id)}
              />
            ))}

            {/* Promo / Coupon Box */}
            <View style={styles.promoCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Ionicons name="pricetag-outline" size={16} color="#FF3D00" style={{ marginRight: 6 }} />
                <Text style={styles.promoHeader}>Have a Coupon / Promo Code?</Text>
              </View>
              {appliedCoupon ? (
                <View style={styles.appliedRow}>
                  <View style={styles.appliedBadge}>
                    <Text style={styles.appliedText}>✓ {appliedCoupon}</Text>
                  </View>
                  <Pressable onPress={handleRemoveCoupon}>
                    <Text style={styles.removeCoupon}>Remove</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.promoInputRow}>
                  <TextInput
                    style={styles.promoInput}
                    placeholder="Enter WELCOME10 or SIP20"
                    placeholderTextColor="#A79D93"
                    value={promoCode}
                    onChangeText={setPromoCode}
                    autoCapitalize="characters"
                  />
                  <Pressable style={styles.applyBtn} onPress={handleApplyCoupon}>
                    <Text style={styles.applyBtnText}>Apply</Text>
                  </Pressable>
                </View>
              )}
            </View>

            {/* Bill Summary Card */}
            <View style={styles.billCard}>
              <Text style={styles.billTitle}>Bill Breakdown</Text>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Item Subtotal</Text>
                <Text style={styles.billValue}>₹{Math.round(subtotal)}</Text>
              </View>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Taxes & Fees (5% GST)</Text>
                <Text style={styles.billValue}>₹{Math.round(tax)}</Text>
              </View>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Delivery Fee</Text>
                <Text style={styles.billValue}>₹{Math.round(deliveryFee)}</Text>
              </View>

              {discountAmount > 0 && (
                <View style={styles.billRow}>
                  <Text style={styles.discountLabel}>Coupon Discount</Text>
                  <Text style={styles.discountValue}>-₹{Math.round(discountAmount)}</Text>
                </View>
              )}

              <View style={styles.divider} />
              <View style={styles.billRow}>
                <Text style={styles.totalLabel}>To Pay</Text>
                <Text style={styles.totalValue}>₹{Math.round(finalTotal)}</Text>
              </View>
            </View>
          </ScrollView>

          {/* Checkout Footer Button */}
          <View style={styles.footer}>
            <View style={styles.footerInfo}>
              <Text style={styles.footerTotalLabel}>Grand Total</Text>
              <Text style={styles.footerTotalVal}>₹{Math.round(finalTotal)}</Text>
            </View>
            <Pressable style={styles.checkoutButton} onPress={handleProceed}>
              <Text style={styles.checkoutText}>Proceed to Checkout -{">"}</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFBF7' },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1.5,
    borderBottomColor: '#FFE4D6',
  },
  backButton: { width: 32, height: 32, justifyContent: 'center' },
  backText: { fontSize: 24, color: '#1F1610', fontWeight: '900' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#1F1610' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '900', color: '#1F1610' },
  emptySubtitle: { fontSize: 13, color: '#8C7D73', marginTop: 4, marginBottom: 20, textAlign: 'center', fontWeight: '600' },
  browseButton: { backgroundColor: '#FF3D00', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16, elevation: 4 },
  browseButtonText: { color: '#FFF', fontWeight: '900', fontSize: 14 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 120 },

  promoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1.5,
    borderColor: '#FFE4D6',
    elevation: 2,
  },
  promoHeader: { fontSize: 13, fontWeight: '900', color: '#1F1610', marginBottom: 10 },
  promoInputRow: { flexDirection: 'row', gap: 10 },
  promoInput: {
    flex: 1,
    backgroundColor: '#FFF5F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    fontSize: 13,
    color: '#1F1610',
    fontWeight: '800',
    borderWidth: 1,
    borderColor: '#FFE4D6',
  },
  applyBtn: {
    backgroundColor: '#FF3D00',
    borderRadius: 14,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  applyBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  appliedRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  appliedBadge: { backgroundColor: '#DCFCE7', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#86EFAC' },
  appliedText: { color: '#15803D', fontWeight: '900', fontSize: 12 },
  removeCoupon: { color: '#DC2626', fontSize: 12, fontWeight: '800' },

  billCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#FFE4D6',
    elevation: 2,
  },
  billTitle: { fontSize: 15, fontWeight: '900', color: '#1F1610', marginBottom: 12 },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  billLabel: { fontSize: 13, color: '#8C7D73', fontWeight: '600' },
  billValue: { fontSize: 13, fontWeight: '800', color: '#1F1610' },
  discountLabel: { fontSize: 13, fontWeight: '900', color: '#16A34A' },
  discountValue: { fontSize: 13, fontWeight: '900', color: '#16A34A' },
  divider: { height: 1, backgroundColor: '#FFE4D6', marginVertical: 10 },
  totalLabel: { fontSize: 16, fontWeight: '900', color: '#1F1610' },
  totalValue: { fontSize: 18, fontWeight: '900', color: '#FF3D00' },

  footer: {
    position: 'absolute',
    bottom: 90,
    left: 16,
    right: 16,
    backgroundColor: '#1F1610',
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 10,
  },
  footerTotalLabel: { fontSize: 11, color: '#FFEAE0', fontWeight: '700' },
  footerTotalVal: { fontSize: 20, fontWeight: '900', color: '#FFFFFF' },
  checkoutButton: {
    backgroundColor: '#FF3D00',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  checkoutText: { color: '#FFF', fontSize: 14, fontWeight: '900' },
});ontSize: 14, fontWeight: '800' },
});
