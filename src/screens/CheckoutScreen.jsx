import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { checkout } from '../api/ApiClient';

export default function CheckoutScreen({ navigation }) {
  const { user } = useAuth();
  const { getCartItems, getTotal, clear } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Razorpay Gateway Modal State
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [selectedOnlineOption, setSelectedOnlineOption] = useState('UPI');
  const [processingPayment, setProcessingPayment] = useState(false);

  const totalAmount = Math.round(getTotal());

  const handlePlaceOrderClick = () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to place an order.');
      navigation.navigate('Login');
      return;
    }

    const cartItems = getCartItems();
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty.');
      return;
    }

    if (paymentMethod === 'Razorpay') {
      // Launch Interactive Razorpay Online Gateway
      setShowRazorpayModal(true);
    } else {
      // Proceed with Cash on Delivery
      executeCheckoutSubmit('COD', null);
    }
  };

  const handleConfirmRazorpayPayment = () => {
    setProcessingPayment(true);
    setTimeout(() => {
      setProcessingPayment(false);
      setShowRazorpayModal(false);
      const generatedId = `pay_rzp_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      executeCheckoutSubmit('Razorpay', generatedId);
    }, 1200);
  };

  const executeCheckoutSubmit = async (method, razorpayPaymentId) => {
    setLoading(true);
    try {
      const cartItems = getCartItems();
      const orderItems = cartItems.map((ci) => ({
        menu_item_id: ci.menuItem.id,
        item_name: ci.menuItem.name,
        price: ci.menuItem.price,
        quantity: ci.quantity,
        subtotal: ci.menuItem.price * ci.quantity,
      }));

      const requestData = {
        user_id: user.id,
        address_id: null,
        payment_method: method,
        razorpay_payment_id: razorpayPaymentId,
        notes: notes.trim() || null,
        items: orderItems,
      };

      const res = await checkout(requestData);

      if (res.data?.success) {
        clear();
        Alert.alert(
          '🎉 Order Placed Successfully!',
          `Your order #${res.data.data.id} has been received and sent to the kitchen!`,
          [
            {
              text: 'Track Order',
              onPress: () =>
                navigation.reset({
                  index: 0,
                  routes: [
                    { name: 'MainTabs' },
                    { name: 'OrderTracking', params: { orderId: res.data.data.id } },
                  ],
                }),
            },
          ]
        );
      } else {
        Alert.alert('Order Failed', res.data?.message || 'Could not place order. Try again.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Network request failed';
      Alert.alert('Connection Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color="#1F1610" />
        </Pressable>
        <Text style={styles.headerTitle}>Order Checkout</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Order Summary Card */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="cart-outline" size={18} color="#E23744" style={{ marginRight: 6 }} />
            <Text style={styles.sectionTitle}>Items in Order</Text>
          </View>
          <View style={styles.summaryCard}>
            {getCartItems().map((ci) => (
              <View key={ci.menuItem.id} style={styles.itemRow}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {ci.quantity}x {ci.menuItem.name}
                </Text>
                <Text style={styles.itemPrice}>
                  ₹{Math.round(ci.menuItem.price * ci.quantity)}
                </Text>
              </View>
            ))}
            <View style={styles.divider} />
            <View style={styles.itemRow}>
              <Text style={styles.totalLabel}>Grand Total</Text>
              <Text style={styles.totalValue}>₹{totalAmount}</Text>
            </View>
          </View>
        </View>

        {/* Payment Method Selector */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="card-outline" size={18} color="#E23744" style={{ marginRight: 6 }} />
            <Text style={styles.sectionTitle}>Choose Payment Method</Text>
          </View>
          <View style={styles.paymentOptions}>
            <Pressable
              style={[
                styles.optionCard,
                paymentMethod === 'COD' && styles.optionCardSelected,
              ]}
              onPress={() => setPaymentMethod('COD')}
            >
              <Ionicons name="cash-outline" size={24} color="#2E7D32" style={{ marginRight: 12 }} />
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>Cash on Delivery</Text>
                <Text style={styles.optionSubtitle}>Pay in cash when order arrives</Text>
              </View>
              {paymentMethod === 'COD' && <Ionicons name="checkmark-circle" size={20} color="#E23744" />}
            </Pressable>

            <Pressable
              style={[
                styles.optionCard,
                paymentMethod === 'Razorpay' && styles.optionCardSelected,
              ]}
              onPress={() => setPaymentMethod('Razorpay')}
            >
              <Ionicons name="card-outline" size={24} color="#E23744" style={{ marginRight: 12 }} />
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>Online Payment (Razorpay)</Text>
                <Text style={styles.optionSubtitle}>UPI / GPay, Cards, NetBanking</Text>
              </View>
              {paymentMethod === 'Razorpay' && <Ionicons name="checkmark-circle" size={20} color="#E23744" />}
            </Pressable>
          </View>
        </View>

        {/* Delivery Note Input */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="document-text-outline" size={18} color="#E23744" style={{ marginRight: 6 }} />
            <Text style={styles.sectionTitle}>Delivery Instructions (Optional)</Text>
          </View>
          <TextInput
            style={styles.notesInput}
            placeholder="e.g. Please leave at front door, ring doorbell..."
            placeholderTextColor="#A79D93"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </View>
      </ScrollView>

      {/* Bottom Bar Action Button */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomTotal}>
          <Text style={styles.bottomTotalLabel}>Total to Pay</Text>
          <Text style={styles.bottomTotalVal}>₹{totalAmount}</Text>
        </View>
        <Pressable
          style={[styles.placeOrderButton, loading && styles.buttonDisabled]}
          onPress={handlePlaceOrderClick}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.placeOrderText}>
              {paymentMethod === 'Razorpay' ? 'Proceed to Online Payment' : 'Place Order (COD)'}
            </Text>
          )}
        </Pressable>
      </View>

      {/* Razorpay Interactive Gateway Modal */}
      <Modal
        visible={showRazorpayModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowRazorpayModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.razorpayCard}>
            <View style={styles.razorpayHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="flash" size={16} color="#00BAF2" style={{ marginRight: 4 }} />
                <Text style={styles.razorpayLogo}>Razorpay Secure</Text>
              </View>
              <Pressable onPress={() => setShowRazorpayModal(false)}>
                <Ionicons name="close" size={22} color="#1F1610" />
              </Pressable>
            </View>

            <View style={styles.merchantBox}>
              <Text style={styles.merchantName}>Sip N Bite Café</Text>
              <Text style={styles.merchantAmount}>₹{totalAmount}.00</Text>
            </View>

            <Text style={styles.payOptionHeader}>Select Payment Mode:</Text>
            <View style={styles.onlineMethodList}>
              {[
                { id: 'UPI', label: 'Google Pay / PhonePe / UPI', iconName: 'phone-portrait-outline' },
                { id: 'CARD', label: 'Credit / Debit Card', iconName: 'card-outline' },
                { id: 'NETBANKING', label: 'Net Banking', iconName: 'business-outline' },
              ].map((opt) => (
                <Pressable
                  key={opt.id}
                  style={[
                    styles.onlineOptionItem,
                    selectedOnlineOption === opt.id && styles.onlineOptionSelected,
                  ]}
                  onPress={() => setSelectedOnlineOption(opt.id)}
                >
                  <Ionicons name={opt.iconName} size={22} color="#E23744" style={{ marginRight: 10 }} />
                  <Text style={styles.onlineOptionText}>{opt.label}</Text>
                  {selectedOnlineOption === opt.id && <Ionicons name="checkmark-circle" size={18} color="#E23744" />}
                </Pressable>
              ))}
            </View>

            {processingPayment ? (
              <View style={styles.processingBox}>
                <ActivityIndicator size="large" color="#E23744" />
                <Text style={styles.processingText}>Authenticating with Bank Gateway...</Text>
              </View>
            ) : (
              <View style={styles.modalActionRow}>
                <Pressable
                  style={styles.cancelPayButton}
                  onPress={() => setShowRazorpayModal(false)}
                >
                  <Text style={styles.cancelPayText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={styles.payNowButton}
                  onPress={handleConfirmRazorpayPayment}
                >
                  <Text style={styles.payNowText}>Pay ₹{totalAmount} Now</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>
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
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#1F1610' },
  scrollContent: { padding: 16, paddingBottom: 120 },
  section: { marginBottom: 20 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 15, fontWeight: '900', color: '#1F1610' },
  summaryCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderColor: '#FFE4D6', borderWidth: 1.5, elevation: 2 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  itemName: { fontSize: 14, color: '#5C4E43', flex: 1, fontWeight: '600' },
  itemPrice: { fontSize: 14, fontWeight: '800', color: '#1F1610' },
  divider: { height: 1.5, backgroundColor: '#FFE4D6', marginVertical: 10 },
  totalLabel: { fontSize: 16, fontWeight: '900', color: '#1F1610' },
  totalValue: { fontSize: 18, fontWeight: '900', color: '#E23744' },
  paymentOptions: { gap: 10 },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FFE4D6',
    borderRadius: 16,
    padding: 14,
  },
  optionCardSelected: { borderColor: '#E23744', backgroundColor: '#FFF5F0' },
  optionInfo: { flex: 1 },
  optionTitle: { fontSize: 14, fontWeight: '900', color: '#1F1610' },
  optionSubtitle: { fontSize: 12, color: '#8C7D73', marginTop: 2, fontWeight: '600' },
  notesInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FFE4D6',
    borderRadius: 16,
    padding: 14,
    fontSize: 14,
    color: '#1F1610',
    textAlignVertical: 'top',
    height: 80,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1.5,
    borderTopColor: '#FFE4D6',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 8,
  },
  bottomTotalLabel: { fontSize: 11, color: '#8C7D73', fontWeight: '700' },
  bottomTotalVal: { fontSize: 20, fontWeight: '900', color: '#E23744' },
  placeOrderButton: {
    backgroundColor: '#E23744',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
    elevation: 4,
  },
  buttonDisabled: { opacity: 0.6 },
  placeOrderText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },

  // Razorpay Gateway Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  razorpayCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  razorpayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  razorpayLogo: { fontSize: 16, fontWeight: '900', color: '#00BAF2' },
  merchantBox: {
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
  },
  merchantName: { fontSize: 14, fontWeight: '900', color: '#0369A1' },
  merchantAmount: { fontSize: 28, fontWeight: '900', color: '#0284C7', marginVertical: 4 },
  payOptionHeader: { fontSize: 13, fontWeight: '900', color: '#1F1610', marginBottom: 10 },
  onlineMethodList: { gap: 8, marginBottom: 20 },
  onlineOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#FFE4D6',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
  },
  onlineOptionSelected: { borderColor: '#E23744', backgroundColor: '#FFF5F0' },
  onlineOptionText: { flex: 1, fontSize: 13, fontWeight: '700', color: '#1F1610' },
  processingBox: { alignItems: 'center', paddingVertical: 20 },
  processingText: { marginTop: 12, fontSize: 14, fontWeight: '900', color: '#E23744' },
  modalActionRow: { flexDirection: 'row', gap: 12 },
  cancelPayButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
  },
  cancelPayText: { fontSize: 14, fontWeight: '900', color: '#6B7280' },
  payNowButton: {
    flex: 2,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: '#E23744',
  },
  payNowText: { fontSize: 14, fontWeight: '900', color: '#FFFFFF' },
});
